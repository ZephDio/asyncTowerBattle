import { UnitRecruit } from "../../../engine/units/domain/units";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class UnitEntityDrawable extends Drawable<UnitRecruit<any>> {
  public image: HTMLImageElement;
  public drawPriority = 4;

  constructor(
    public position: Position,
    public size: Size,
    public type: string
  ) {
    super();
    this.image = new Image(size.width, size.height);
    this.image.src = Resources.unit[this.type].resource.src;
  }

  applyStyle(context: CanvasRenderingContext2D) {
    (context.strokeStyle = "black"), (context.fillStyle = "black");
    context.lineWidth = 1;
  }

  draw(context: CanvasRenderingContext2D): void {
    // this.applyStyle(context);
    // const renderShape = Resources.unit[this.type].resource;
    // if (renderShape == "ellipse") {
    //   this.drawEllipse(context, this.size, this.position);
    //   return;
    // }
    // if (renderShape == "rectangle") {
    //   this.drawRectangle(context, this.size, this.position);
    // }

    this.drawImage(context, this.size, this.position, this.image);
  }
}
