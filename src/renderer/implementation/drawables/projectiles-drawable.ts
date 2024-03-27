import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class ProjectileDrawable extends Drawable {
	public image: HTMLImageElement;
	public drawPriority: number = 5;
	constructor(
		public position: Position,
		public size: Size,
		public theta: number,
		public type: string,
	) {
		super();
		this.image = (Resources as any).projectiles[type].resource.image;
	}

	draw(context: CanvasRenderingContext2D) {
		this.drawImage(context, this.size, this.position, this.image, this.theta);
	}
}
