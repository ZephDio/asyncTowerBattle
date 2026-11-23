import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { TDrawable } from "../../../traits/render/drawable";
import { ScreenPosition } from "../../../position";

export type TooltipContent = string[];

// Screen units.
const PADDING = 0.9;
const LINE_SIZE = 1.4;
const LINE_HEIGHT = 1.8;
const GAP = 0.8;

const INK = "rgb(22,28,46)";
const PAPER = "rgb(240,230,214)";
const PAPER_SHADE = "rgb(214,198,182)";

// A small pixel-art card beside a hovered banner element, on the `side` facing the board. Its content is read every
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
		context.save();
		context.globalAlpha = 1;
		context.textBaseline = "middle";
		context.textAlign = "left";
		context.font = `${LINE_SIZE * unit}px text`;
		let textWidth = 0;
		for (const line of lines) textWidth = Math.max(textWidth, context.measureText(line).width);

		const width = Math.round(textWidth + 2 * PADDING * unit);
		const height = Math.round((lines.length * LINE_HEIGHT + 2 * PADDING - 0.4) * unit);
		const anchor = this.getCanvasPosition(context, position);
		const offset = (this.reach + GAP) * unit;
		let left = this.side === "right" ? anchor.x + offset : anchor.x - offset - width;
		let top = anchor.y - height / 2;
		left = Math.round(Math.min(Math.max(left, 0), context.canvas.width - width));
		top = Math.round(Math.min(Math.max(top, 0), context.canvas.height - height));
		this.drawCard(context, left, top, width, height, Math.max(2, Math.round(unit * 0.16)));

		let y = top + (PADDING + LINE_HEIGHT / 2 - 0.2) * unit;
		context.fillStyle = INK;
		context.font = `${LINE_SIZE * unit}px text`;
		for (const line of lines) {
			context.fillText(line, left + PADDING * unit, y);
			y += LINE_HEIGHT * unit;
		}
		context.restore();
	}

	// An ink frame two art pixels thick with stepped corners, around paper with a shaded bottom edge.
	private drawCard(
		context: CanvasRenderingContext2D,
		left: number,
		top: number,
		width: number,
		height: number,
		p: number,
	) {
		context.fillStyle = INK;
		context.fillRect(left + 2 * p, top, width - 4 * p, height);
		context.fillRect(left + p, top + p, width - 2 * p, height - 2 * p);
		context.fillRect(left, top + 2 * p, width, height - 4 * p);
		context.fillStyle = PAPER_SHADE;
		context.fillRect(left + 3 * p, top + 2 * p, width - 6 * p, height - 4 * p);
		context.fillRect(left + 2 * p, top + 3 * p, width - 4 * p, height - 6 * p);
		context.fillStyle = PAPER;
		context.fillRect(left + 3 * p, top + 2 * p, width - 6 * p, height - 5 * p);
		context.fillRect(left + 2 * p, top + 3 * p, width - 4 * p, height - 7 * p);
	}
}
