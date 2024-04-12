import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../traits/render/drawable";
import { Caster } from "../traits/engine/cast";
import { ScreenPosition } from "../position";

export class CasterCamembert extends Derive(TDrawable) {
	objective = 100;
	constructor(public caster: ImplementsTrait<typeof Caster>) {
		super({});
	}

	drawPriority = 5;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		if (!this.caster.castInProgress) return;
		context.globalAlpha = 1;
		const size = this.getCanvasSize(context, 2, 2, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		context.strokeStyle = "black";
		//this.drawLine(context,canvasPosition.x,canvasPosition.y, canvasPosition.x +35, canvasPosition.y+35)
		this.drawArc(
			context,
			canvasPosition.x,
			canvasPosition.y,
			size,
			this.caster.castInProgress.progress / this.objective,
		);
	}
}
