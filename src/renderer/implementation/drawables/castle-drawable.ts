import { Castle } from "../../../engine/castle/entity/castle";
import { CastleRecruit } from "../../../engine/castle/recruit/castle-recruit";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class CastleDrawable extends Drawable<CastleRecruit<Castle>> {
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
		// this.applyStyle(context);
		// this.drawRectangle(context, this.size, this.position);
		this.drawImage(context, this.size, this.position, this.image);
	}

	applyStyle(context: CanvasRenderingContext2D) {
		context.lineWidth = 1;
		context.strokeStyle = "black";
		const color = Resources.castle.resource.color;
		context.fillStyle = color;
	}
}
