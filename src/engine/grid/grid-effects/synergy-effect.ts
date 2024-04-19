import { Derive } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../../shared/position";

import { ArmyGrid } from "../grid";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";

export class SynergyEffectHud extends Derive(TDrawable, TRenderable) {
	drawPriority = 8;
	size: number;
	constructor(
		public cell: Cell,
		public grid: ArmyGrid,
		public isActivated: boolean,
	) {
		super({});
		this.size = grid.cellSize;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 0.4;
		context.fillStyle = "red";
		if (this.isActivated) {
			context.fillStyle = "blue";
		}
		const { width, height } = this.getCanvasSize(context, this.size, this.size);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, { width: width / 2, height: height / 2 }, canvasPosition);
	}

	get position() {
		return this.cell;
	}
}
