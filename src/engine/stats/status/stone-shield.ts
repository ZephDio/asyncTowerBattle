import { Derive } from "@ddd-ts/traits";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../stats";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { ScreenPosition } from "../../../shared/position";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";

export class StoneShield extends Derive(Status, TDrawable) {
	key = "stoneShield" as const;
	stackable = false;
	clock = 0;
	duration = Infinity;
	stats: Stats;

	tick() {}

	stack(_status: StoneShield) {}

	onRemove() {}

	override drawPriority: DrawPriority.FlyingGridElement;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.fillStyle = "yellow";
		context.strokeStyle = "yellow";
		context.lineWidth = 2;
		const size = this.getCanvasSize(context, 3 * scale, 3 * scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		context.globalAlpha = 0.3;
		this.drawEllipse(context, size, canvasPosition, 1);
		context.globalAlpha = 0.1;
		context.fill();
		context.stroke();
		context.globalAlpha = 1;
	}
}
