import { Derive, ImplementsTrait, Subtrait, Trait, implementsTrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../../position";
import { PercentToReal } from "../../../../renderer/implementation/canvas-renderer";
import { TRenderable } from "../renderable";
import { TDrawable } from "../drawable";
import {
	ROLL_END,
	ROLL_INK_BOTTOM,
	ROLL_INK_TOP,
	SHADE,
	ScrollShape,
	drawDescriptorScroll,
	scrollRows,
} from "./descriptor-scroll";
import { Tag, Tagged } from "../../engine/tags/tagged";
import { TBaseStats } from "../../../../engine/stats/base-stats";
import { castSpeedToSecond, frameToSeconds } from "../../../seconds";
import { TagBadge, drawTagBadgeRows, sortTags } from "./tag-badge";
import { rarityOf } from "../../engine/rarity";
import { IconResources } from "../../../../renderer/resources/icons.resources";
import { grantedSciencesOf } from "../../engine/science";
import { HudElementResources } from "../../../../renderer/resources/hud-element.resources";

export const TDescriptor = Trait((base) => {
	abstract class IDescriptor extends base {
		abstract description: Description;
	}

	return IDescriptor;
});

export type StatTrend = "better" | "worse" | "neutral";
export type LiveLine = { value: string; trend: StatTrend };

const TrendColors: Record<StatTrend, string> = {
	better: "#1e7b1e",
	worse: "#b3261e",
	neutral: "#000000",
};

// A stat a piece doesn't have is NaN, shown as 0.
export const formatStat = (value: number) => (Number.isNaN(value) ? "0" : `${Number(value.toFixed(2))}`);

// Compares a live stat to its base value. Pass higherIsBetter = false for costs and cooldowns.
export const liveStat = (value: string, current: number, base: number, higherIsBetter = true): LiveLine => {
	if (Number.isNaN(current) || Number.isNaN(base)) return { value, trend: "neutral" };
	const delta = current - base;
	if (Math.abs(delta) <= Math.abs(base) * 1e-6) return { value, trend: "neutral" };
	return { value, trend: delta > 0 === higherIsBetter ? "better" : "worse" };
};

// Implemented by battle entities whose descriptor shows values that change during the battle.
// These lines are read every frame and override static extra lines with the same key.
export const TLiveDescriptor = Trait((base) => {
	abstract class ILiveDescriptor extends base {
		abstract liveLines(): Record<string, string | LiveLine>;
	}

	return ILiveDescriptor;
});

// A description line is plain text, or segments where live values are drawn in their trend color.
export type DescriptionLine = string | (string | LiveLine)[];

// Implemented by battle entities whose description text holds values that change during the battle.
// These lines are read every frame and replace the static description lines.
export const TLiveDescriptionText = Trait((base) => {
	abstract class ILiveDescriptionText extends base {
		abstract liveDescription(): DescriptionLine[];
	}

	return ILiveDescriptionText;
});

export const HTDescriptor = Subtrait([TDescriptor], (base, Props) => {
	abstract class IDescriptor extends base {
		description: Description;
		// What this element is described as, so a battle entity shows the sciences its recruit grants (see grantedSciencesOf).
		describedBy: ImplementsTrait<typeof TDescriptor>;
		constructor(props: { descriptor: ImplementsTrait<typeof TDescriptor> } & typeof Props) {
			super(props);
			this.description = props.descriptor.description;
			this.describedBy = props.descriptor;
		}
	}

	return IDescriptor;
});

// The scroll is laid out in art pixels, drawn `p` canvas pixels each (see drawDescriptorScroll), about 0.16 screen units.
const COLUMNS = 120;
// The text stays this far from the sheet's sides.
const TEXT_LEFT = 12;
const TEXT_WIDTH = COLUMNS - 2 * TEXT_LEFT;
const TITLE_ROLL = 22;
const TITLE_SIZE = 14;
const LINE_SIZE = 10;
const LINE_HEIGHT = 13;
// The room the last line's descenders need under the row it sits in.
const LINE_DESCENT = 3;
const SECTION_GAP = 0.5;
const TAG_SIZE = 9;
const TAG_ROW_HEIGHT = TAG_SIZE * 1.15;
const TAG_ROLL_MIN = 16;
const TAG_PADDING = 4;
const MAX_TAGS = 4;
const TAGS_PER_ROW = 2;
const BODY_PADDING = 4;
const BODY_MIN = 80;
const STAMP_SIZE = 19;
// The scroll hangs from this point, in screen percent units: where the top of the old banner was.
const SCROLL_TOP = { x: 86, y: 89.5 };

const INK = "rgb(22,28,46)";

export class DescriptionHud extends Derive(TRenderable, TDrawable) {
	drawPriority: 9;
	tags: Tag[];
	tagBadges: TagBadge[];

	constructor(
		public item: ImplementsTrait<typeof TDescriptor>,
		public position: ScreenPosition = PercentToReal({ x: 86, y: 73 }),
	) {
		super({});
		this.tags = implementsTrait(this.item, Tagged) ? this.item.tags : [];
		this.tagBadges = sortTags(this.tags)
			.slice(0, MAX_TAGS)
			.map((tag) => new TagBadge(tag));
	}

	get extraLines(): Record<string, string | LiveLine> {
		const staticLines = this.item.description.extraLines ?? {};
		if (!implementsTrait(this.item, TLiveDescriptor)) return staticLines;
		return { ...staticLines, ...this.item.liveLines() };
	}

	get descriptionLines(): DescriptionLine[] {
		if (!implementsTrait(this.item, TLiveDescriptionText)) return this.item.description.description;
		return this.item.liveDescription();
	}

	// The baseline of each line, stats then description, in art pixels under the top of the body.
	getLinesOffsets() {
		const offsets: number[] = [];
		const { statColumns, sectionStarts } = this.item.description;
		const statCount = Object.keys(this.extraLines).length;
		for (let index = 0; index < statCount; index++) {
			offsets.push((Math.floor(index / statColumns) + 0.8) * LINE_HEIGHT);
		}
		let row = Math.ceil(statCount / statColumns);
		this.descriptionLines.forEach((_, index) => {
			if (sectionStarts.includes(index)) row += SECTION_GAP;
			offsets.push((row + 0.8) * LINE_HEIGHT);
			row++;
		});
		return { offsets, rows: row };
	}

	getShape(): ScrollShape & { lines: ReturnType<DescriptionHud["getLinesOffsets"]> } {
		const lines = this.getLinesOffsets();
		const tagRows = Math.ceil(this.tagBadges.length / TAGS_PER_ROW);
		const tagRoll =
			tagRows > 1
				? Math.ceil(TAG_SIZE + (tagRows - 1) * TAG_ROW_HEIGHT) + ROLL_INK_TOP + ROLL_INK_BOTTOM + 2 * TAG_PADDING
				: TAG_ROLL_MIN;
		// The stamps of the sciences the piece grants take a row of their own under the lines.
		const stamps = grantedSciencesOf(this.item).length > 0 ? STAMP_SIZE + BODY_PADDING : 0;
		const body = Math.max(
			BODY_MIN,
			Math.ceil(lines.rows * LINE_HEIGHT) + stamps + 2 * BODY_PADDING + SHADE * 2 + LINE_DESCENT,
		);
		return { columns: COLUMNS, topRoll: TITLE_ROLL, bottomRoll: tagRoll, body, lines };
	}

	draw(context: CanvasRenderingContext2D, _position: ScreenPosition, scale: number) {
		const unit = this.getCanvasSize(context, 1, 1, scale).width;
		const p = Math.max(2, Math.round(unit * 0.16));
		const shape = this.getShape();
		const anchor = this.getCanvasPosition(context, PercentToReal(SCROLL_TOP));
		const height = scrollRows(shape) * p;
		const left = Math.round(Math.min(anchor.x - (COLUMNS * p) / 2, context.canvas.width - COLUMNS * p));
		const top = Math.round(Math.min(anchor.y, context.canvas.height - height - SHADE * p));
		drawDescriptorScroll(context, HudElementResources.descriptorScroll[rarityOf(this.item)], left, top, shape, p);

		context.save();
		context.fillStyle = INK;
		// Title, in the top roll between its ink rows and its curls
		const title = this.item.description.name;
		const titleCenter = top + (ROLL_INK_TOP + (shape.topRoll - ROLL_INK_TOP - ROLL_INK_BOTTOM) / 2) * p;
		const titleWidth = (COLUMNS - 2 * ROLL_END - 4) * p;
		// Long titles get a smaller font so they fit between the curls instead of being squeezed.
		context.font = `${TITLE_SIZE * p}px title`;
		const fontSize = TITLE_SIZE * p * Math.min(1, titleWidth / context.measureText(title).width);
		context.font = `${fontSize}px title`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(title, left + (COLUMNS * p) / 2, titleCenter);
		context.textBaseline = "alphabetic";
		// Stats and description lines
		const lines = [...Object.entries(this.extraLines)];
		const description = this.descriptionLines;
		const bodyTop = top + (shape.topRoll + SHADE + BODY_PADDING) * p;
		const textLeft = left + TEXT_LEFT * p;
		const textWidth = TEXT_WIDTH * p;
		const { statColumns, statLabels } = this.item.description;
		const statWidth = textWidth / statColumns;
		context.font = `${LINE_SIZE * p}px text`;
		context.textAlign = "left";
		lines.forEach(([key, value], index) => {
			const x = textLeft + (index % statColumns) * statWidth;
			const y = bodyTop + (shape.lines.offsets[index] ?? 0) * p;
			const label = `${statLabels[key] ?? key}: `;
			if (typeof value === "string") {
				context.fillText(`${label}${value}`, x, y, statWidth);
				return;
			}
			const labelWidth = Math.min(context.measureText(label).width, statWidth);
			context.fillText(label, x, y, statWidth);
			context.fillStyle = TrendColors[value.trend];
			context.fillText(value.value, x + labelWidth, y, Math.max(0, statWidth - labelWidth));
			context.fillStyle = INK;
		});
		description.forEach((line, index) => {
			const y = bodyTop + (shape.lines.offsets[index + lines.length] ?? 0) * p;
			if (typeof line === "string") {
				context.fillText(line, textLeft, y, textWidth);
				return;
			}
			// Segments share the line's width, squeezed together when the line is too long.
			const texts = line.map((segment) => (typeof segment === "string" ? segment : segment.value));
			const widths = texts.map((text) => context.measureText(text).width);
			const totalWidth = widths.reduce((sum, width) => sum + width, 0);
			const squeeze = Math.min(1, textWidth / Math.max(totalWidth, 1));
			let x = textLeft;
			line.forEach((segment, segmentIndex) => {
				const width = (widths[segmentIndex] ?? 0) * squeeze;
				context.fillStyle = typeof segment === "string" ? INK : TrendColors[segment.trend];
				context.fillText(texts[segmentIndex] ?? "", x, y, Math.max(width, 1));
				x += width;
			});
			context.fillStyle = INK;
		});
		// Tags, in the bottom roll
		const rollTop = top + (rowsAbove(shape) + ROLL_INK_TOP) * p;
		const rollInner = shape.bottomRoll - ROLL_INK_TOP - ROLL_INK_BOTTOM;
		const tagsCenter = { x: left + (COLUMNS * p) / 2, y: rollTop + (rollInner / 2) * p };
		drawTagBadgeRows(context, this.tagBadges, tagsCenter, TAG_SIZE * p, (COLUMNS - 2 * ROLL_END - 4) * p, TAGS_PER_ROW);
		context.restore();
		// Sciences granted: the first stamp at the bottom right of the sheet, the next ones towards the left
		context.save();
		context.imageSmoothingEnabled = false;
		const stampsTop = top + (rowsAbove(shape) - STAMP_SIZE - BODY_PADDING) * p;
		grantedSciencesOf(this.item).forEach((science, index) => {
			const x = left + (COLUMNS - TEXT_LEFT - (index + 1) * STAMP_SIZE) * p;
			context.drawImage(IconResources.scienceStamps[science].image, x, stampsTop, STAMP_SIZE * p, STAMP_SIZE * p);
		});
		context.restore();
	}
}

// The rows above the bottom roll.
function rowsAbove(shape: ScrollShape) {
	return shape.topRoll + shape.body;
}

export class Description {
	// Extra lines are drawn as "label: value", statColumns per row. A line without a label shows its key.
	statLabels: Record<string, string> = {};
	statColumns = 1;
	// The description lines that start a new section, e.g. an effect after the weapon: a little space comes before them.
	sectionStarts: number[] = [];

	constructor(
		public name: string,
		public description: string[],

		public extraLines?: Record<string, string>,
	) {}
}

// Marks where a caster's cast time, in seconds, goes in its description lines.
export const CAST_TIME = "{cast time}";

// A description whose CAST_TIME lines show the blueprint's cast time, and the live one during battle.
export class CasterDescription extends Description {
	private readonly template: string[];
	private readonly baseCastSpeed: number;

	constructor(name: string, description: string[], caster: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		const castTime = `${castSpeedToSecond(caster.stats.castSpeed)}`;
		super(
			name,
			description.map((line) => line.replace(CAST_TIME, castTime)),
		);
		this.template = description;
		this.baseCastSpeed = caster.stats.castSpeed;
	}

	liveDescription(castSpeed: number): DescriptionLine[] {
		return this.template.map((line) => {
			const [before, after] = line.split(CAST_TIME);
			if (after === undefined) return line;
			if (castSpeed <= 0) return [liveStat("Stopped", castSpeed, this.baseCastSpeed)];
			return [before ?? "", liveStat(`${castSpeedToSecond(castSpeed)}`, castSpeed, this.baseCastSpeed), after];
		});
	}
}

export type TowerLinesDescription = {
	"projectile damage": string;
	"cast speed": string;
	"food consumption": string;
};
const TowerStatLabels: TowerLinesDescription = {
	"projectile damage": "⚔️",
	"cast speed": "💠",
	"food consumption": "🌽",
};

export class TowerDescription extends Description {
	override statLabels: Record<string, string> = TowerStatLabels;
	override statColumns = 2;

	constructor(name: string, description: string[], tower: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		const extraLines: TowerLinesDescription = {
			"projectile damage": Number.isNaN(tower.stats.projectileDamage) ? "0" : `${tower.stats.projectileDamage}`,
			"cast speed": `${castSpeedToSecond(tower.stats.castSpeed)}s`,
			"food consumption": `${tower.stats.foodConsumptionOnCast}`,
		};
		super(name, description, extraLines);
	}
}

// The blacksmith tower's description: the max health it gives to Kinfolk units, which grows during the battle.
export class BlacksmithDescription extends TowerDescription {
	constructor(name: string, tower: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		super(name, BlacksmithDescription.lines("0"), tower);
	}

	private static lines(value: string) {
		return ["Your Kinfolk units", `receive ${value}💚,`, "increase this value", "by 1 every 4 casts"];
	}

	liveDescription(value: number): DescriptionLine[] {
		return [
			"Your Kinfolk units",
			["receive ", liveStat(`${value}`, value, 0), "💚,"],
			"increase this value",
			"by 1 every 4 casts",
		];
	}
}

// The lighthouse's description: what its beams do, then, a little apart, its effect.
export class LighthouseDescription extends TowerDescription {
	override sectionStarts = [3];

	constructor(name: string, tower: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		super(
			name,
			["Each cast, two beams", "sweep left and right,", "then top and bottom", "Every 10 enemies hit:", "gain 1 🏹"],
			tower,
		);
	}
}

export type UnitLinesDescription = {
	health: string;
	"castle damage": string;
	"move speed": string;
	"food consumption": string;
	"production time": string;
};
// Units eat every 2 seconds (BattleUnit.consumeFood).
const UnitStatLabels: UnitLinesDescription = {
	health: "💚",
	"castle damage": "🗡️",
	"move speed": "🥾",
	"food consumption": "🌽/2s",
	"production time": "⏱",
};

export class UnitDescription extends Description {
	override statLabels: Record<string, string> = UnitStatLabels;
	override statColumns = 2;

	constructor(name: string, description: string[], unit: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		const extraLines: UnitLinesDescription = {
			health: `${unit.stats.health}`,
			"castle damage": `${unit.stats.castleDamage}`,
			"move speed": `${unit.stats.speed}`,
			"food consumption": `${unit.stats.foodConsumption}`,
			"production time": `${frameToSeconds(unit.stats.summonTime)}s`,
		};
		super(name, description, extraLines);
	}
}

// Marks where a unit's projectile damage goes in its description lines.
export const PROJECTILE_DAMAGE = "{projectile damage}";

// A unit description whose PROJECTILE_DAMAGE lines show the blueprint's projectile damage, and the live one during battle.
export class ProjectileUnitDescription extends UnitDescription {
	private readonly template: string[];
	private readonly baseProjectileDamage: number;

	constructor(name: string, description: string[], unit: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		const damage = formatStat(unit.stats.projectileDamage);
		super(
			name,
			description.map((line) => line.replace(PROJECTILE_DAMAGE, damage)),
			unit,
		);
		this.template = description;
		this.baseProjectileDamage = unit.stats.projectileDamage;
	}

	liveDescription(projectileDamage: number): DescriptionLine[] {
		return this.template.map((line) => {
			const [before, after] = line.split(PROJECTILE_DAMAGE);
			if (after === undefined) return line;
			return [before ?? "", liveStat(formatStat(projectileDamage), projectileDamage, this.baseProjectileDamage), after];
		});
	}
}

export type BarrackLinesDescription = {
	"production speed": string;
};
export class BarrackDescription extends Description {
	constructor(name: string, description: string[], barrack: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		const extraLines: BarrackLinesDescription = {
			"production speed": `x${barrack.stats.castSpeed}`,
		};
		super(name, description, extraLines);
	}
}
