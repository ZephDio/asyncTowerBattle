import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { TDrawable } from "../../../traits/render/drawable";
import { ScreenPosition } from "../../../position";
import { HudElementResources } from "../../../../renderer/resources/hud-element.resources";

export type TooltipContent = string[];

// Screen units.
const LINE_SIZE = 1.4;
const LINE_HEIGHT = 1.8;
const GAP = 0.6;
// Art pixels.
export const ROLL = 10;
const PAD_X = 8;
const EDGE_ROWS = 2;
export const PAD_Y = ROLL + 2;

const INK = "rgb(22,28,46)";

// A small parchment scroll beside a hovered banner element, on the `side` facing the board. Its content is read every
// frame, so live values stay current while it is open.
export class HudTooltip extends Derive(TRenderable, TDrawable) {
	drawPriority = 9;
	constructor(
		public position: ScreenPosition,
		private reach: number,
		private side: "left" | "right",
		private content: () => TooltipContent,
	) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const lines = this.content();
		const unit = this.getCanvasSize(context, 1, 1, scale).width;
		const p = Math.max(2, Math.round(unit * 0.16));
		context.save();
		context.globalAlpha = 1;
		context.textBaseline = "middle";
		context.textAlign = "left";
		context.font = `${LINE_SIZE * unit}px text`;
		let textWidth = 0;
		for (const line of lines) textWidth = Math.max(textWidth, context.measureText(line).width);

		const columns = Math.ceil(textWidth / p) + 2 * PAD_X;
		const rows = Math.ceil((lines.length * LINE_HEIGHT * unit) / p) + 2 * PAD_Y;
		const width = columns * p;
		const height = rows * p;
		const anchor = this.getCanvasPosition(context, position);
		const offset = (this.reach + GAP) * unit;
		let left = this.side === "right" ? anchor.x + offset : anchor.x - offset - width;
		let top = anchor.y - height / 2;
		left = Math.round(Math.min(Math.max(left, 0), context.canvas.width - width));
		top = Math.round(Math.min(Math.max(top, 0), context.canvas.height - height - 2 * p));
		HudTooltip.drawScroll(context, left, top, columns, rows, p);

		let y = top + (PAD_Y * p + (LINE_HEIGHT * unit) / 2);
		context.fillStyle = INK;
		for (const line of lines) {
			context.fillText(line, left + PAD_X * p, y);
			y += LINE_HEIGHT * unit;
		}
		context.restore();
	}

	// A parchment sheet hanging between two rolls, as on the descriptor scroll, outlined in 2px ink on its own shadow.
	// It is cut in nine pieces drawn by scripts/generate-scroll.py: the corners keep their size, the edges and the
	// center repeat, all at `p` canvas pixels per art pixel.
	static drawScroll(
		context: CanvasRenderingContext2D,
		left: number,
		top: number,
		columns: number,
		rows: number,
		p: number,
	) {
		const parts = HudElementResources.scroll;
		if (!Object.values(parts).every((image) => image.complete && image.naturalWidth > 0)) return;
		columns = Math.max(columns, 2 * ROLL);
		rows = Math.max(rows, 2 * PAD_Y + EDGE_ROWS);
		const edge = ROLL * p;
		const topHeight = PAD_Y * p;
		const bottomHeight = (PAD_Y + EDGE_ROWS) * p;
		const width = columns * p;
		const height = rows * p;
		const innerWidth = width - 2 * edge;
		const innerHeight = height - topHeight - (bottomHeight - EDGE_ROWS * p);
		const middleY = top + topHeight;
		const bottomY = top + height - PAD_Y * p;

		context.save();
		context.imageSmoothingEnabled = false;
		const tile = parts.center;
		for (let y = 0; y < innerHeight; y += tile.height * p) {
			for (let x = 0; x < innerWidth; x += tile.width * p) {
				const w = Math.min(tile.width * p, innerWidth - x);
				const h = Math.min(tile.height * p, innerHeight - y);
				context.drawImage(tile, 0, 0, w / p, h / p, left + edge + x, middleY + y, w, h);
			}
		}
		context.drawImage(parts.topLeft, left, top, edge, topHeight);
		context.drawImage(parts.top, left + edge, top, innerWidth, topHeight);
		context.drawImage(parts.topRight, left + width - edge, top, edge, topHeight);
		context.drawImage(parts.left, left, middleY, edge, innerHeight);
		context.drawImage(parts.right, left + width - edge, middleY, edge, innerHeight);
		context.drawImage(parts.bottomLeft, left, bottomY, edge, bottomHeight);
		context.drawImage(parts.bottom, left + edge, bottomY, innerWidth, bottomHeight);
		context.drawImage(parts.bottomRight, left + width - edge, bottomY, edge, bottomHeight);
		context.restore();
	}
}
