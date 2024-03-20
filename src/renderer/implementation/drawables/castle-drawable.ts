import { Castle } from "../../../engine/castle/entity/castle";
import { CastleRecruit } from "../../../engine/castle/recruit/castle-recruit";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class CastleDrawable extends Drawable<CastleRecruit<Castle>> {
  public image: HTMLImageElement;
  public drawPriority: number = 2;
  constructor(public position: Position, public size: Size) {
    super();
    this.image = new Image(size.width, size.height);
    this.image.src = Resources.castle.resource.src;
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
