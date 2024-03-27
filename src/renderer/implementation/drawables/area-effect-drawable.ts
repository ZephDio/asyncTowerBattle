import { AreaEffect } from "../../../engine/area-effect/area-effect";
import { HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class AreaEffectDrawable extends Drawable<AreaEffect> {
	drawPriority: number = 1;
	shape: string;
	image: HTMLImageElement;
	constructor(
		public areaEffect: AreaEffect,
		public size: Size,
		public position: Position,
	) {
		super();
		this.image = new Image(this.size.width, this.size.width);
		console.log(this.areaEffect.type);
		this.shape = Resources.areaEffects[this.areaEffect.type].resource.shape;
	}

	applyStyle(context: CanvasRenderingContext2D) {
		const color = Resources.areaEffects[this.areaEffect.type].resource.color;
		context.strokeStyle = color;
		context.fillStyle = "transparent";
		context.lineWidth = 11;
	}
	draw(context: CanvasRenderingContext2D) {
		this.applyStyle(context);
		this.drawEllipse(context, this.size, this.position);
	}
}
