import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class UnitEntityDrawable extends Drawable {
	public image: HTMLImageElement;
	public drawPriority = 4;

	constructor(
		public position: Position,
		public size: Size,
		public type: string,
	) {
		super();
		this.image = (Resources as any).unit[this.type].resource.image;
	}

	draw(context: CanvasRenderingContext2D): void {
		this.drawImage(context, this.size, this.position, this.image);
	}
}
