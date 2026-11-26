import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition, ScreenPosition } from "../../position";
import { TDrawable } from "../../traits/render/drawable";
import { DrawPriority } from "../../traits/render/image-drawable";
import { TRenderable } from "../../traits/render/renderable";
import { drawWoodSign } from "../../traits/render/wood-sign";
import { STANDARD_CELL_SIZE } from "../../../engine/grid/grid-scale";

// Grid units, at the standard cell size: the sign's size, and how far above the offer's cell center it hangs.
const SIZE = { width: 6.4, height: 1.3 };
const RISE = 2.9;

// The second sign of a reserved offer, over its slot.
export class ReservedSignHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;

	constructor(private offer: { cell: Cell }) {
		super({});
	}

	get position() {
		const { x, y } = this.offer.cell;
		return new GridPosition({ x: (x + 0.5) * STANDARD_CELL_SIZE, y: (y + 0.5) * STANDARD_CELL_SIZE + RISE });
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const center = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, SIZE.width, SIZE.height, scale);
		drawWoodSign(context, center, size, this.getCanvasSize(context, 1, 1, scale).width, "RESERVED");
	}
}
