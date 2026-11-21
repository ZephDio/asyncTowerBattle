import { Derive, ImplementsTrait, Subtrait, Trait, implementsTrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../../position";
import { PercentToReal } from "../../../../renderer/implementation/canvas-renderer";
import { BannerBackground } from "./banner-background";
import { Tag, Tagged } from "../../engine/tags/tagged";
import { TBaseStats } from "../../../../engine/stats/base-stats";
import { castSpeedToSecond, frameToSeconds } from "../../../seconds";
import { TagBadge, drawTagBadgeRows, sortTags } from "./tag-badge";
import { rarityOf } from "../../engine/rarity";
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

export const formatStat = (value: number) => `${Number(value.toFixed(2))}`;

// Compares a live stat to its base value. Pass higherIsBetter = false for costs and cooldowns.
export const liveStat = (value: string, current: number, base: number, higherIsBetter = true): LiveLine => {
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
		constructor(props: { descriptor: ImplementsTrait<typeof TDescriptor> } & typeof Props) {
			super(props);
			this.description = props.descriptor.description;
		}
	}

	return IDescriptor;
});

// The space before a new section of description lines, in lines.
const SECTION_GAP = 0.5;

export class DescriptionHud extends Derive(BannerBackground) {
	drawPriority: 9;
	titlePosition: ScreenPosition;
	// The stat and description lines start below this point, under the scroll's top roll.
	linesOrigin: ScreenPosition;
	linesPosition: ScreenPosition[];
	tagsPosition: ScreenPosition;
	tags: Tag[];
	tagBadges: TagBadge[];

	constructor(
		public item: ImplementsTrait<typeof TDescriptor>,
		public position: ScreenPosition = PercentToReal({ x: 86, y: 73 }),
	) {
		super({});
		this.bannerImage = HudElementResources.descriptorBanner[rarityOf(this.item)].image;
		this.titlePosition = this.position.add(new ScreenPosition({ x: 0, y: 14.4 }));
		this.linesOrigin = this.position.add(new ScreenPosition({ x: 0, y: 10.8 }));
		this.linesPosition = this.getLinesPositions();
		this.tags = implementsTrait(this.item, Tagged) ? this.item.tags : [];
		this.tagBadges = sortTags(this.tags).map((tag) => new TagBadge(tag));
		this.tagsPosition = this.position.add(new ScreenPosition({ x: 0, y: -14.5 }));
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

	getLinesPositions() {
		const positions = [];
		const { statColumns } = this.item.description;
		const statCount = Object.keys(this.extraLines).length;
		for (let index = 0; index < statCount; index++) {
			const row = Math.floor(index / statColumns) + 1;
			const x = -7 + (index % statColumns) * (14 / statColumns);
			positions.push(this.linesOrigin.add(new ScreenPosition({ x, y: -2.1 * (row + 0.1) })));
		}
		let i = Math.ceil(statCount / statColumns);
		const { sectionStarts } = this.item.description;
		this.descriptionLines.forEach((_, index) => {
			if (sectionStarts.includes(index)) i += SECTION_GAP;
			i++;
			positions.push(this.linesOrigin.add(new ScreenPosition({ x: -7, y: -2.1 * (i + 0.8) })));
		});
		return positions;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		this.linesPosition = this.getLinesPositions();
		const bannerSize = this.getCanvasSize(context, 19.3, 33, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawBanner(context, bannerSize, canvasPosition);
		// Title
		const titlePosition = this.getCanvasPosition(context, this.titlePosition);
		const title = this.item.description.name;
		// Long titles get a smaller font so they fit between the roll's curls instead of being squeezed.
		const titleFontSize = this.getCanvasSize(context, 11.5, 2.4, scale);
		context.font = `${titleFontSize.height}px title`;
		const titleWidth = context.measureText(title).width;
		const titleHeight = titleFontSize.height * Math.min(1, titleFontSize.width / titleWidth);
		context.font = `${titleHeight}px title`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = "#000000";
		context.fillText(title, titlePosition.x, titlePosition.y);
		context.textBaseline = "alphabetic";
		// Description lines
		const lines = [...Object.entries(this.extraLines)];
		const description = this.descriptionLines;
		const descriptionFontSize = this.getCanvasSize(context, 14, 1.6, scale);
		const statFontSize = this.getCanvasSize(context, 14 / this.item.description.statColumns, 1.6, scale);
		const { statLabels } = this.item.description;
		context.font = `${descriptionFontSize.height}px text`;
		context.textAlign = "left";
		const linesPosition = lines.map((_, index) =>
			this.getCanvasPosition(context, this.linesPosition[index] as ScreenPosition),
		);
		const descriptionPositions = description.map((_, index) =>
			this.getCanvasPosition(context, this.linesPosition[index + lines.length] as ScreenPosition),
		);
		lines.forEach(([key, value], index) => {
			const linePosition = linesPosition[index];
			if (!linePosition) return;
			const label = `${statLabels[key] ?? key}: `;
			if (typeof value === "string") {
				context.fillText(`${label}${value}`, linePosition.x, linePosition.y, statFontSize.width);
				return;
			}
			const labelWidth = Math.min(context.measureText(label).width, statFontSize.width);
			context.fillText(label, linePosition.x, linePosition.y, statFontSize.width);
			context.fillStyle = TrendColors[value.trend];
			context.fillText(
				value.value,
				linePosition.x + labelWidth,
				linePosition.y,
				Math.max(0, statFontSize.width - labelWidth),
			);
			context.fillStyle = "#000000";
		});
		description.forEach((line, index) => {
			const descriptionPosition = descriptionPositions[index];
			if (!descriptionPosition) return;
			if (typeof line === "string") {
				context.fillText(line, descriptionPosition.x, descriptionPosition.y, descriptionFontSize.width);
				return;
			}
			// Segments share the line's width, squeezed together when the line is too long.
			const texts = line.map((segment) => (typeof segment === "string" ? segment : segment.value));
			const widths = texts.map((text) => context.measureText(text).width);
			const totalWidth = widths.reduce((sum, width) => sum + width, 0);
			const squeeze = Math.min(1, descriptionFontSize.width / Math.max(totalWidth, 1));
			let x = descriptionPosition.x;
			line.forEach((segment, segmentIndex) => {
				const width = (widths[segmentIndex] ?? 0) * squeeze;
				context.fillStyle = typeof segment === "string" ? "#000000" : TrendColors[segment.trend];
				context.fillText(texts[segmentIndex] ?? "", x, descriptionPosition.y, Math.max(width, 1));
				x += width;
			});
			context.fillStyle = "#000000";
		});
		// Tags
		const tagsPosition = this.getCanvasPosition(context, this.tagsPosition);
		const tagHeight = this.getCanvasSize(context, 0, 1.35, scale).height;
		const tagsMaxWidth = this.getCanvasSize(context, 16, 0, scale).width;
		drawTagBadgeRows(context, this.tagBadges, tagsPosition, tagHeight, tagsMaxWidth, 2);
	}
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
			"projectile damage": `${tower.stats.projectileDamage}`,
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
			["Each cast, two beams", "sweep left and right,", "then top and bottom", "Every 10 enemies hit:", "gain 1🏹"],
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
	"production time": "🕒",
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
