import { SerializedGrid } from "../../../engine/grid/grid";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Drawable } from "./drawable";

export class GridDrawable extends Drawable<SerializedGrid> {
  public image: HTMLImageElement;
  public drawPriority: number = 2;
  constructor(public position: Position, public gridSize: Size, public tileSize: number) {
    super();
  }

  draw(context: CanvasRenderingContext2D) {
    this.applyStyle(context);
    for (const [ci, coloumn] of new Array(this.gridSize.width + 1).entries()) {
      this.drawLine(
        context,
        this.position.x + ci * this.tileSize,
        this.position.y,
        this.position.x + ci * this.tileSize,
        this.position.y - this.gridSize.height * this.tileSize
      );
      for (const [ri, raw] of new Array(this.gridSize.height + 1).entries()) {
        this.drawLine(
          context,
          this.position.x,
          this.position.y - ri * this.tileSize,
          this.position.x + this.gridSize.width * this.tileSize,
          this.position.y - ri * this.tileSize
        );
      }
    }
  }

  applyStyle(context: CanvasRenderingContext2D) {
    context.lineWidth = 1;
    context.strokeStyle = "black";
  }
}
