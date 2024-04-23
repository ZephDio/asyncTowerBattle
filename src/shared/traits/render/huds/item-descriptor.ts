import { Derive, ImplementsTrait, Subtrait, Trait, implementsTrait } from "@ddd-ts/traits";
import { TRenderable } from "../renderable";
import { ScreenPosition } from "../../../position";
import { PercentToReal } from "../../../../renderer/implementation/canvas-renderer";
import { BannerBackground } from "./banner-background";
import { Tag, Tagged } from "../../engine/tags";

export const TDescriptor = Trait((base) => {
	abstract class IDescriptor extends base {
		abstract description: Description;
	}

	return IDescriptor;
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
	position: ScreenPosition;
	titlePosition: ScreenPosition;
	linesPosition: ScreenPosition[];
	tags : Tag[]

	extraLines: Record<string, string>;
	constructor(public item: ImplementsTrait<typeof TDescriptor> & ImplementsTrait<typeof TRenderable>) {
		super({});
		this.position = this.getPosition();
		this.titlePosition = this.position.add(new ScreenPosition({ x: 0, y: 10 }));
		this.extraLines = this.item.description.extraLines ?? {};
		this.linesPosition = this.getLinesPositions();
		this.tags = implementsTrait(this.item, Tagged) ? this.item.tags : []
	}

	getPosition() {
		return PercentToReal({ x: 66.3, y: 50 });
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
		const bannerSize =this.getCanvasSize(context, 19.3, 33, scale);
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
			context.fillText(`${key}: ${value}`, linePosition.x, linePosition.y, descriptionFontSize.width);
		});
		description.forEach((line, index) => {
			const descriptionPosition = descriptionPositions[index];
			if (!descriptionPosition) return;
			context.fillText(line, descriptionPosition.x, descriptionPosition.y, descriptionFontSize.width);
		});
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
	"cast cost": string;
	range: string;
};
export class TowerDescription extends Description {
	constructor(name: string, description: string[], extraLines: TowerLinesDescription) {
		super(name, description, extraLines);
	}
}

export type UnitLinesDescription = {
	health: string;
	damage: string;
	"move speed": string;
	"production cost": string;
};
export class UnitDescription extends Description {
	constructor(name: string, description: string[], extraLines: UnitLinesDescription) {
		super(name, description, extraLines);
	}
}

export type BarrackLinesDescription = {
	"production speed": string;
};
export class BarrackDescription extends Description {
	constructor(name: string, description: string[], extraLines: BarrackLinesDescription) {
		super(name, description, extraLines);
	}
}
