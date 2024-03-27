import { HudElement } from "../../../shared/hud-element";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class HudElementDrawable<T extends HudElement> extends Drawable<T> {
	drawPriority: number = 1;

	image: HTMLImageElement;
	constructor(
		public hudElement: HudElement,
		public size: Size,
		public position: Position,
	) {
		super();
		this.image = new Image(this.size.width, this.size.width);
		this.image.src = Resources.hudElement[this.hudElement.type].resource.src;
	}

	draw(context: CanvasRenderingContext2D) {
		this.drawImage(context, this.size, this.position, this.image);
	}
}
