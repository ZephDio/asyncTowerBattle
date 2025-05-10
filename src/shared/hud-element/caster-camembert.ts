import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../traits/render/drawable";
import { Caster } from "../traits/engine/cast";
import { ScreenPosition } from "../position";
import { DrawPriority } from "../traits/render/image-drawable";

export class CasterCamembert extends Derive(TDrawable) {
	constructor(public caster: ImplementsTrait<typeof Caster>) {
		super({});
	}

	drawPriority = DrawPriority.HUD;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		if (!this.caster.castInProgress) return;
		context.globalAlpha = 1;
		const size = this.getCanvasSize(context, 2, 2, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		context.strokeStyle = "black";
		context.lineWidth = 3;
		this.drawArc(
			context,
			canvasPosition.x,
			canvasPosition.y,
			size,
			this.caster.castInProgress.progress / this.caster.castInProgress.cost,
		);
	}
}
