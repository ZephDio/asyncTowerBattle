import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { TDrawable } from "../../../traits/render/drawable";
import { ScreenPosition } from "../../../position";

export type TooltipContent = string[];

// Screen units.
const LINE_SIZE = 1.4;
const LINE_HEIGHT = 1.8;
const GAP = 0.6;
// Art pixels.
const ROLL = 10;
const PAD_X = 8;
const PAD_Y = ROLL + 2;

type Rgb = readonly [number, number, number];
const INK: Rgb = [22, 28, 46];
// The thatch ramp of the pixel-art style guide, as parchment.
const MAUVE: Rgb = [138, 103, 99];
const STRAW_SHADE: Rgb = [175, 140, 121];
const STRAW: Rgb = [227, 193, 140];
const CREAM: Rgb = [245, 239, 169];
const FIBER: Rgb = [214, 176, 128];
const SHADOW = "rgba(22,28,46,0.31)";

const css = ([r, g, b]: Rgb) => `rgb(${r},${g},${b})`;

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
		this.drawScroll(context, left, top, columns, rows, p);

		let y = top + (PAD_Y * p + (LINE_HEIGHT * unit) / 2);
		context.fillStyle = css(INK);
		for (const line of lines) {
			context.fillText(line, left + PAD_X * p, y);
			y += LINE_HEIGHT * unit;
		}
		context.restore();
	}

	// A parchment sheet hanging between two rolls, as on the descriptor scroll, outlined in 2px ink on its own shadow.
	private drawScroll(
		context: CanvasRenderingContext2D,
		left: number,
		top: number,
		columns: number,
		rows: number,
		p: number,
	) {
		const rect = (x: number, y: number, w: number, h: number, color: Rgb | string) => {
			if (w <= 0 || h <= 0) return;
			context.fillStyle = typeof color === "string" ? color : css(color);
			context.fillRect(left + x * p, top + y * p, w * p, h * p);
		};
		// An ink block with its corners cut by one art pixel.
		const block = (x: number, y: number, w: number, h: number) => {
			rect(x + 1, y, w - 2, h, INK);
			rect(x, y + 1, w, h - 2, INK);
		};

		rect(2, rows, columns - 4, 2, SHADOW);

		const sheetLeft = 3;
		const sheetWidth = columns - 2 * sheetLeft;
		rect(sheetLeft, ROLL - 3, sheetWidth, rows - 2 * ROLL + 6, INK);
		rect(sheetLeft + 2, ROLL - 3, sheetWidth - 4, rows - 2 * ROLL + 6, STRAW);
		rect(sheetLeft + 2, ROLL, sheetWidth - 4, 2, STRAW_SHADE);
		rect(sheetLeft + 2, rows - ROLL - 2, sheetWidth - 4, 2, STRAW_SHADE);
		rect(sheetLeft + sheetWidth - 4, ROLL, 2, rows - 2 * ROLL, STRAW_SHADE);
		for (let y = ROLL + 4; y < rows - ROLL - 3; y += 4) {
			for (let x = sheetLeft + 5 + ((y * 7) % 9); x < sheetLeft + sheetWidth - 10; x += 13 + ((x + y) % 5)) {
				rect(x, y, 3 + ((x * y) % 4), 1, FIBER);
			}
		}

		// Each roll is a parchment cylinder lit from above, ending in a curl on both sides.
		const cylinder: Rgb[] = [CREAM, CREAM, STRAW, STRAW, STRAW_SHADE, MAUVE];
		for (const y of [0, rows - ROLL]) {
			block(0, y, columns, ROLL);
			cylinder.forEach((shade, row) => rect(2, y + 2 + row, columns - 4, 1, shade));
			for (const x of [0, columns - ROLL]) {
				block(x, y, ROLL, ROLL);
				rect(x + 2, y + 2, ROLL - 4, ROLL - 4, STRAW_SHADE);
				rect(x + 2, y + 2, ROLL - 5, ROLL - 5, CREAM);
				rect(x + 4, y + 4, ROLL - 7, ROLL - 7, STRAW);
				rect(x + 4, y + 4, 2, 2, INK);
			}
		}
	}
}
