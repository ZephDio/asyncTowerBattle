import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../shared/traits/render/drawable";
import { TRenderable } from "../../shared/traits/render/renderable";
import { ScreenPosition } from "../../shared/position";
import { HudTooltip, PAD_Y } from "../../shared/hud-element/battle/army-resume/hud-tooltip";
import { IconResources } from "../../renderer/resources/icons.resources";
import { MAX_LIVES, MAX_ROUNDS } from "../game-rules";

export type RunResult = { life: number; wins: number; round: number };

// Screen units. The scroll hangs behind the army grid, which is centered on it.
export const SCROLL_CENTER = new ScreenPosition({ x: 50, y: 30.6 });
const SCROLL = { width: 80, height: 57 };
const INK = "#161c2e";

// The big parchment of the end of a run: lives, wins and round on top, with room under them for the army's board.
export class RunResumeScroll extends Derive(TRenderable, TDrawable) {
	drawPriority = 0;
	position = SCROLL_CENTER;

	constructor(private result: RunResult) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		const unit = this.getCanvasSize(context, 1, 1).width;
		const p = Math.max(2, Math.round(unit * 0.16));
		const columns = Math.round((SCROLL.width * unit) / p);
		const rows = Math.round((SCROLL.height * unit) / p);
		const center = this.getCanvasPosition(context, position);
		const left = Math.round(center.x - (columns * p) / 2);
		const top = Math.round(center.y - (rows * p) / 2);
		context.save();
		context.globalAlpha = 1;
		HudTooltip.drawScroll(context, left, top, columns, rows, p);

		const labelY = top + (PAD_Y + 1) * p + 1.4 * unit;
		const valueY = labelY + 3.6 * unit;
		const spacing = SCROLL.width * 0.28 * unit;
		const columnsX = [center.x - spacing, center.x, center.x + spacing];
		context.fillStyle = INK;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = `${1.6 * unit}px text`;
		["Lives", "Wins", "Round"].forEach((label, index) => context.fillText(label, columnsX[index]!, labelY));

		context.font = `${3.4 * unit}px title`;
		context.fillText(String(this.result.wins), columnsX[1]!, valueY);
		context.fillText(`${Math.min(this.result.round, MAX_ROUNDS)}/${MAX_ROUNDS}`, columnsX[2]!, valueY);

		const heart = 3.2 * unit;
		for (let index = 0; index < MAX_LIVES; index++) {
			const icon = index < this.result.life ? IconResources.heartContainer : IconResources.emptyHeartContainer;
			const x = columnsX[0]! + (index - (MAX_LIVES - 1) / 2) * heart;
			context.drawImage(icon.image, x - heart / 2, valueY - heart / 2, heart, heart);
		}
		context.restore();
	}
}
