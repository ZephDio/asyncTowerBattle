import { Derive } from "@ddd-ts/traits";
import { ScreenPosition } from "../position";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";
import { drawWoodSign } from "../traits/render/wood-sign";

// The sign above the reserve grid. Its frame is drawn outside of its size, 1 unit thick, so the sign is as wide as the grid.
const FRAME = 1;
const GAP = 0.2;
export class ReserveSignHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	position: ScreenPosition;
	readonly size: { width: number; height: number };

	constructor({ gridPosition, gridWidth, cellSize, gridHeight }: ReserveSignProps) {
		super({});
		this.size = { width: gridWidth * cellSize - 2 * FRAME, height: 2.6 };
		this.position = new ScreenPosition({
			x: gridPosition.x + (gridWidth * cellSize) / 2,
			y: gridPosition.y + gridHeight * cellSize + this.size.height / 2 + FRAME + GAP,
		});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		const center = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		drawWoodSign(context, center, size, this.getCanvasSize(context, 1, 1).width, "RESERVE");
	}
}

type ReserveSignProps = {
	gridPosition: { x: number; y: number };
	gridWidth: number;
	gridHeight: number;
	cellSize: number;
};
