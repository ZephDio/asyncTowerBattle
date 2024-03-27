import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Drawable } from "./drawable";

export class GridDrawable extends Drawable {
	public image: HTMLImageElement;
	public drawPriority: number = 1;
	constructor(
		public position: Position,
		public gridSize: Size,
		public tileSize: number,
	) {
		super();
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = "#6C6";
		context.rect(
			this.position.x,
			this.position.y,
			this.gridSize.width * this.tileSize,
			-this.gridSize.height * this.tileSize,
		);
		context.fill();

		this.applyStyle(context);
		for (const ci of new Array(this.gridSize.width + 1).keys()) {
			this.drawLine(
				context,
				this.position.x + ci * this.tileSize,
				this.position.y,
				this.position.x + ci * this.tileSize,
				this.position.y - this.gridSize.height * this.tileSize,
			);
		}
		for (const ri of new Array(this.gridSize.height + 1).keys()) {
			this.drawLine(
				context,
				this.position.x,
				this.position.y - ri * this.tileSize,
				this.position.x + this.gridSize.width * this.tileSize,
				this.position.y - ri * this.tileSize,
			);
		}
	}

	applyStyle(context: CanvasRenderingContext2D) {
		context.lineWidth = 3;
		context.strokeStyle = "rgba(0,0,0,0.1)";
	}
}
