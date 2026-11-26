import { Derive } from "@ddd-ts/traits";
import { ScreenPosition } from "../position";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";
import { drawWoodFrameBelow } from "../traits/render/wood-panel";
import { drawWoodSign } from "../traits/render/wood-sign";

// The sign above the reserve grid. Its frame is drawn outside of its size, 1 unit thick, so the sign is as wide as the
// grid, and the frame runs on around the grid's sides and bottom.
const FRAME = 1;
const TEXT_SCALE = 0.8;
export class ReserveSignHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	position: ScreenPosition;
	readonly size: { width: number; height: number };
	private readonly grid: { center: { x: number; y: number }; width: number; height: number };

	constructor({ gridPosition, gridWidth, cellSize, gridHeight }: ReserveSignProps) {
		super({});
		this.size = { width: gridWidth * cellSize, height: 2.6 };
		this.position = new ScreenPosition({
			x: gridPosition.x + (gridWidth * cellSize) / 2,
			y: gridPosition.y + gridHeight * cellSize + this.size.height / 2 + FRAME,
		});
		this.grid = {
			center: { x: gridPosition.x + (gridWidth * cellSize) / 2, y: gridPosition.y + (gridHeight * cellSize) / 2 },
			width: gridWidth * cellSize,
			height: gridHeight * cellSize,
		};
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		const center = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		drawWoodSign(context, center, size, this.getCanvasSize(context, 1, 1).width, "RESERVE", TEXT_SCALE);
		const unit = this.getCanvasSize(context, 1, 1).width;
		const grid = this.getCanvasSize(context, this.grid.width, this.grid.height);
		const gridCenter = this.getCanvasPosition(context, new ScreenPosition(this.grid.center));
		drawWoodFrameBelow(
			context,
			gridCenter.x - grid.width / 2,
			gridCenter.y - grid.height / 2,
			grid.width,
			grid.height,
			Math.max(1, Math.round(unit * 0.2)),
		);
	}
}

type ReserveSignProps = {
	gridPosition: { x: number; y: number };
	gridWidth: number;
	gridHeight: number;
	cellSize: number;
};
