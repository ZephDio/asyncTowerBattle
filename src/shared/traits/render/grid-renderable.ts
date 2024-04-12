import { Subtrait } from "@ddd-ts/traits";
import { TGrid } from "../../../engine/grid/tgrid";
import { TDrawable } from "./drawable";

export const TGridDrawable = Subtrait([TGrid, TDrawable], (base) => {
	abstract class IGridDrawable extends base {
		drawPriority = 1;
		draw(context: CanvasRenderingContext2D): void {
			context.fillStyle = "#6C6";
			context.globalAlpha = 1;
			const position = this.getCanvasPosition(context, this.position);
			const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
			context.rect(position.x, position.y, this.width * tileSize, -this.height * tileSize);
			context.fill();

			context.lineWidth = 3;
			context.strokeStyle = "rgba(0,0,0,0.1)";
			for (const ci of new Array(this.width + 1).keys()) {
				this.drawLine(
					context,
					position.x + ci * tileSize,
					position.y,
					position.x + ci * tileSize,
					position.y - this.height * tileSize,
				);
			}
			for (const ri of new Array(this.height + 1).keys()) {
				this.drawLine(
					context,
					position.x,
					position.y - ri * tileSize,
					position.x + this.width * tileSize,
					position.y - ri * tileSize,
				);
			}
			context.stroke();
		}
	}
	return IGridDrawable;
});
