import { Derive } from "@ddd-ts/traits";
import { ScreenPosition } from "../../position";
import { TDrawable } from "../../traits/render/drawable";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { TRenderable } from "../../traits/render/renderable";
import { DrawPriority } from "../../traits/render/image-drawable";

export class BattleClockHud extends Derive(TRenderable, TDrawable) {
	override drawPriority = DrawPriority.HUD;
	size = { width: 5, height: 3 };
	constructor(
		public timer: { clock: number },
		public position = PercentToReal({ x: 6, y: 87 }),
	) {
		super({});
	}

	get time() {
		const date = new Date("1970-01-01T00:00:00Z");
		date.setMilliseconds(this.timer.clock * 31.25);
		return {
			minutes: date.getMinutes(),
			seconds: date.getSeconds(),
			deciSeconds: Math.floor(date.getMilliseconds() / 100),
		};
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.fillStyle = "black";
		const size = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		context.font = `${size.height}px text`;
		const canvasPosition = this.getCanvasPosition(context, position);
		const { minutes, seconds, deciSeconds } = this.time;
		context.fillText(
			`${minutes.toString()}:${seconds.toString().padStart(2, "0")}.${deciSeconds.toString()}`,
			canvasPosition.x,
			canvasPosition.y,
		);
	}
}
