import { HudElement } from "../../../shared/hud-element";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class HudElementDrawable extends Drawable {
	drawPriority: number = 1;

	image: HTMLImageElement;
	constructor(
		public hudElement: HudElement,
		public size: Size,
		public position: Position,
	) {
		super();
		this.image = (Resources as any).hudElement[this.hudElement.type].resource.image;
	}

	draw(context: CanvasRenderingContext2D) {
		this.drawImage(context, this.size, this.position, this.image);
	}
}
