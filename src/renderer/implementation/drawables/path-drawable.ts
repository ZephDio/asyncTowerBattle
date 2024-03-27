import { ArmyPath } from "../../../engine/path/entity/path";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class PathDrawable extends Drawable<ArmyPath> {
	public drawPriority: number = 1;
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
		const color = Resources.path[type].resource;
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = 1;
	}
}
