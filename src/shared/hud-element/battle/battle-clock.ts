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

	get miliseconds() {
		const date = new Date("1970-01-01T00:00:00Z");
		date.setMilliseconds(this.timer.clock * 31.25);
		const diff = date.getTime() - new Date("1970-01-01T00:00:00Z").getTime();
		return diff;
	}

	get deciSeconds() {
		return Math.floor(this.miliseconds / 100) % 10;
	}

	get seconds() {
		return Math.floor(this.miliseconds / 1000) % 60;
	}

	get minutes() {
		return Math.floor(this.miliseconds / 60000);
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.fillStyle = "black";
		const size = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		context.font = `${size.height}px text`;
		const canvasPosition = this.getCanvasPosition(context, position);
		context.fillText(
			`${this.minutes.toString()}:${this.seconds.toString().padStart(2, "0")}.${this.deciSeconds.toString()}`,
			canvasPosition.x,
			canvasPosition.y,
		);
	}
}
