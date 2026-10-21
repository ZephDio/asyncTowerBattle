import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition, ScreenPosition } from "../../../shared/position";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../grid/tgrid";

// Shop-phase overlay marking junction tiles, which right-click can turn. Positioned at the grid origin so draw() can
// place every cell.
export class PathPreview extends Derive(TDrawable, TRenderable) {
	// Same layer as path tiles; its y=0 position sorts it after them, so it sits on the tiles but under towers and units.
	drawPriority = DrawPriority.CarpetStyleGridElement;

	constructor(public junctions: Cell[]) {
		super({});
	}

	get position() {
		return new GridPosition({ x: 0, y: 0 });
	}

	draw(context: CanvasRenderingContext2D, gridOrigin: ScreenPosition, scale: number): void {
		const toCanvas = (cell: Cell) =>
			this.getCanvasPosition(
				context,
				new ScreenPosition({
					x: gridOrigin.x + (cell.x + 0.5) * STANDARD_CELL_SIZE * scale,
					y: gridOrigin.y + (cell.y + 0.5) * STANDARD_CELL_SIZE * scale,
				}),
			);
		const { width } = this.getCanvasSize(context, STANDARD_CELL_SIZE * 0.08, 0, scale);
		context.save();
		context.globalAlpha = 1;
		context.strokeStyle = "#1E6FFF";
		context.lineWidth = width;
		context.fillStyle = "white";
		for (const junction of this.junctions) {
			const { x, y } = toCanvas(junction);
			context.beginPath();
			context.arc(x, y, width * 1.5, 0, 2 * Math.PI);
			context.fill();
			context.stroke();
		}
		context.restore();
	}
}
