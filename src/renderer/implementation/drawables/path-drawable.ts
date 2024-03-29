import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class PathDrawable extends Drawable {
	public drawPriority: number = 2;
	constructor(
		public tiles: { position: Position; type: string }[],
		public size: Size,
	) {
		super();
	}
	draw(context: CanvasRenderingContext2D) {
		for (const tile of this.tiles) {
			this.applyStyle(context, tile.type);
			this.drawRectangle(context, this.size, tile.position);
		}
	}

	applyStyle(context: CanvasRenderingContext2D, type: string) {
		const color = (Resources as any).path[type].resource;
		context.strokeStyle = "transparent";
		context.fillStyle = color;
		context.lineWidth = 0;
	}
}
