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

	get deciSeconds() {
		return Math.floor(this.timer.clock * 0.33) % 10;
	}

	get realDeciSeconds() {
		return Math.floor(this.timer.clock * 3.3);
	}
	get seconds() {
		return Math.floor(this.realDeciSeconds / 100) % 60;
	}

	get realSeconds() {
		return Math.floor(this.deciSeconds / 100);
	}

	get minutes() {
		return Math.floor(this.realSeconds / 60);
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
