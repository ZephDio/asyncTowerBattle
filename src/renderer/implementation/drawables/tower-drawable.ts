import { Tower } from "../../../engine/tower/entity/tower";
import { TowerRecruit } from "../../../engine/tower/recruit/tower-recruit";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class TowerDrawable extends Drawable<TowerRecruit<Tower>> {
  public image: HTMLImageElement;
  public drawPriority: number = 2;
  constructor(
    public position: Position,
    public size: Size,
    public type: string
  ) {
    super();
    this.image = new Image(size.width, size.height);
    this.image.src = Resources.tower[this.type].resource.src;
  }

  draw(context: CanvasRenderingContext2D) {
    this.drawImage(context, this.size, this.position, this.image);
  }

  applyStyle(context: CanvasRenderingContext2D) {
    context.lineWidth = 1;
    context.strokeStyle = "black";
    const color = Resources.tower[this.type].resource.color;
    context.fillStyle = color;
  }
}
