import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class TowerDrawable extends Drawable {
	public image: HTMLImageElement;
	public drawPriority: number = 3;
	constructor(
		public position: Position,
		public size: Size,
		public type: string,
	) {
		super();
		this.image = Resources.tower[this.type].resource.image;
	}

	draw(context: CanvasRenderingContext2D) {
		this.drawImage(context, this.size, this.position, this.image);
	}
}
