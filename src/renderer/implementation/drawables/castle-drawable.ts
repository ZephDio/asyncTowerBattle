import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class CastleDrawable extends Drawable {
	public image: HTMLImageElement;
	public drawPriority: number = 2;
	constructor(
		public position: Position,
		public size: Size,
	) {
		super();
		this.image = Resources.castle.resource.image;
	}

	draw(context: CanvasRenderingContext2D) {
		this.drawImage(context, this.size, this.position, this.image);
	}
}
