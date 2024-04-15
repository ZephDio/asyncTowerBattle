import { Derive, ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { TRenderable } from "../renderable";
import { TGrid } from "../../../../engine/grid/tgrid";
import { Cell, GridPosition, ScreenPosition } from "../../../position";

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

export class DescriptionHud extends Derive(TRenderable) {
	drawPriority: 9;
	position: ScreenPosition;
	titlePosition: ScreenPosition;
	constructor(
		public item: ImplementsTrait<typeof TDescriptor> & ImplementsTrait<typeof TRenderable>,
		grid: ImplementsTrait<typeof TGrid>,
	) {
		super({});
		this.position = this.getPosition(grid);
		this.titlePosition = this.position.add(new ScreenPosition({ x: 0, y: 10 }));
	}

	getPosition(grid: ImplementsTrait<typeof TGrid>) {
		let position = this.item.position;
		if (position instanceof Cell) {
			position = grid.cellToGrid(position);
		}
		if (position instanceof GridPosition) {
			position = grid.gridToScreenPosition(position);
		}
		return position.add(new ScreenPosition({ x: 10, y: 0 }));
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		const size = this.getCanvasSize(context, 15, 25, scale);
		context.fillStyle = "#FFB266";
		context.strokeStyle = "#000000";
		context.lineWidth = 3;
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, size, canvasPosition);
		const titlePosition = this.getCanvasPosition(context, this.titlePosition);
		const text = this.item.description.name;
		const fontSize = this.getCanvasSize(context, 14, 2, scale);
		context.font = `${fontSize.height}px title`;
		context.textAlign = "center";
		context.fillStyle = "#000000";
		context.fillText(text, titlePosition.x, titlePosition.y, fontSize.width);
	}
}

export class Description {
	constructor(
		public name: string,
		public description: string,
	) {}
}
