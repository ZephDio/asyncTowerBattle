import { Derive, ImplementsTrait, Subtrait, Trait, implementsTrait } from "@ddd-ts/traits";
import { TRenderable } from "../renderable";
import { ScreenPosition } from "../../../position";
import { PercentToReal } from "../../../../renderer/implementation/canvas-renderer";
import { BannerBackground } from "./banner-background";
import { Tag, Tagged } from "../../engine/tags/tagged";
import { TBaseStats } from "../../../../engine/stats/base-stats";
import { castSpeedToSecond, frameToSeconds, secondsToFrame } from "../../../seconds";
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

export class DescriptionHud extends Derive(BannerBackground) {
	drawPriority: 9;
	titlePosition: ScreenPosition;
	linesPosition: ScreenPosition[];
	tagsPosition: ScreenPosition;
	tags: Tag[];
	tagBadges: TagBadge[];

	constructor(
		public item: ImplementsTrait<typeof TDescriptor> & ImplementsTrait<typeof TRenderable>,
		public position: ScreenPosition = PercentToReal({ x: 86, y: 73 }),
	) {
		super({});
		this.bannerImage = HudElementResources.descriptorBanner[rarityOf(this.item)].image;
		this.titlePosition = this.position.add(new ScreenPosition({ x: 0, y: 10 }));
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

	getLinesPositions() {
		const positions = [];
		let i = 0;
		for (const [_] of Object.entries(this.extraLines)) {
			i++;
			positions.push(this.titlePosition.add(new ScreenPosition({ x: -7, y: -2.1 * (i + 0.1) })));
		}
		this.item.description.description.forEach(() => {
			i++;
			positions.push(this.titlePosition.add(new ScreenPosition({ x: -7, y: -2.1 * (i + 0.8) })));
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
		const titleFontSize = this.getCanvasSize(context, 14, 2, scale);
		context.font = `${titleFontSize.height}px title`;
		context.textAlign = "center";
		context.fillStyle = "#000000";
		context.fillText(title, titlePosition.x, titlePosition.y, titleFontSize.width);
		// Description lines
		const lines = [...Object.entries(this.extraLines)];
		const description = this.item.description.description;
		const descriptionFontSize = this.getCanvasSize(context, 14, 1.6, scale);
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
			if (typeof value === "string") {
				context.fillText(`${key}: ${value}`, linePosition.x, linePosition.y, descriptionFontSize.width);
				return;
			}
			const label = `${key}: `;
			const labelWidth = Math.min(context.measureText(label).width, descriptionFontSize.width);
			context.fillText(label, linePosition.x, linePosition.y, descriptionFontSize.width);
			context.fillStyle = TrendColors[value.trend];
			context.fillText(
				value.value,
				linePosition.x + labelWidth,
				linePosition.y,
				Math.max(0, descriptionFontSize.width - labelWidth),
			);
			context.fillStyle = "#000000";
		});
		description.forEach((line, index) => {
			const descriptionPosition = descriptionPositions[index];
			if (!descriptionPosition) return;
			context.fillText(line, descriptionPosition.x, descriptionPosition.y, descriptionFontSize.width);
		});
		// Tags
		const tagsPosition = this.getCanvasPosition(context, this.tagsPosition);
		const tagHeight = this.getCanvasSize(context, 0, 1.35, scale).height;
		const tagsMaxWidth = this.getCanvasSize(context, 16, 0, scale).width;
		drawTagBadgeRows(context, this.tagBadges, tagsPosition, tagHeight, tagsMaxWidth, 2);
	}
}

export class Description {
	constructor(
		public name: string,
		public description: string[],

		public extraLines?: Record<string, string>,
	) {}
}

export type TowerLinesDescription = {
	damage: string;
	"cast speed": string;
	"food consumption": string;
	range: string;
};
export class TowerDescription extends Description {
	constructor(name: string, description: string[], tower: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		const extraLines: TowerLinesDescription = {
			damage: `${tower.stats.damage}`,
			"cast speed": `${castSpeedToSecond(tower.stats.castSpeed)}s`,
			"food consumption": `${tower.stats.foodConsumptionOnCast}`,
			range: `${tower.stats.range}`,
		};
		super(name, description, extraLines);
	}
}

export type UnitLinesDescription = {
	health: string;
	damage: string;
	"move speed": string;
	"food consumption": string;
	"production time": string;
};
export class UnitDescription extends Description {
	constructor(name: string, description: string[], unit: ImplementsTrait<ReturnType<typeof TBaseStats>>) {
		const extraLines: UnitLinesDescription = {
			health: `${unit.stats.health}`,
			damage: `${unit.stats.damage}`,
			"move speed": `${unit.stats.speed}`,
			"food consumption": `${unit.stats.foodConsumption}`,
			"production time": `${frameToSeconds(unit.stats.summonTime)}s`,
		};
		secondsToFrame(unit.stats.summonTime);
		super(name, description, extraLines);
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
