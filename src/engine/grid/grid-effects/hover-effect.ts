import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../../shared/position";
import { TGrid } from "../tgrid";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";

export class HoverEffect extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	size: number;
	constructor(
		public cell: Cell,
		public grid: ImplementsTrait<typeof TGrid>,
	) {
		super({});
		this.size = grid.cellSize;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 0.3;
		context.fillStyle = "yellow";
		const { width, height } = this.getCanvasSize(context, this.size, this.size);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, { width, height }, canvasPosition);
	}

	get position() {
		return this.cell;
	}
}
