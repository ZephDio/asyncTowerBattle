import { AreaEffect } from "../../../engine/area-effect/area-effect";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Drawable } from "./drawable";

export class AreaEffectDrawable extends Drawable {
	drawPriority: number = 1;
	shape: string;
	constructor(
		public areaEffect: AreaEffect,
		public size: Size,
		public position: Position,
	) {
		super();
		this.shape = "ellipse";
	}

	applyStyle(context: CanvasRenderingContext2D) {
		context.strokeStyle = "red";
		context.fillStyle = "transparent";
		context.lineWidth = 11;
	}

	draw(context: CanvasRenderingContext2D) {
		this.applyStyle(context);
		this.drawEllipse(context, this.size, this.position);
	}
}
