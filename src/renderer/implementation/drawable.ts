import { Path, PathNode } from "../../engine/path/domain/path";
import { Castle, CastleRecruit } from "../../engine/castle/domain/castle";
import { Tower, TowerRecruit } from "../../engine/tower/domain/tower";
import { UnitRecruit } from "../../engine/units/domain/units";
import { Position } from "../../shared/position";
import { Size } from "../../shared/size";
import { Resources } from "../resources";

export abstract class Drawable<T = any> {
  abstract drawPriority: number;
  abstract draw(context: CanvasRenderingContext2D): void;
  protected drawEllipse(
    context: CanvasRenderingContext2D,
    size: Size,
    position: Position
  ) {
    context.beginPath();
    context.ellipse(
      position.x,
      position.y,
      size.width / 2,
      size.height / 2,
      0,
      0,
      2 * Math.PI
    );
    context.fill();
    context.stroke();
  }
  protected drawRectangle(
    context: CanvasRenderingContext2D,
    size: Size,
    position: Position
  ) {
    context.strokeRect(
      position.x - size.width / 2,
      position.y - size.height / 2,
      size.width,
      size.height
    );
    context.fillRect(
      position.x - size.width / 2,
      position.y - size.height / 2,
      size.width,
      size.height
    );
    context.stroke();
  }
  protected drawLines(context: CanvasRenderingContext2D, points: Position[]) {
    context.beginPath();
    for (const point of points) {
      context.lineTo(point.x, point.y);
    }
    context.stroke();
  }

  protected drawImage(
    context: CanvasRenderingContext2D,
    size: Size,
    position: Position,
    image: HTMLImageElement
  ) {
    context.drawImage(
      image,
      position.x - size.width / 2,
      position.y - size.height / 2,
      size.width,
      size.height
    );
  }
}

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
    // const renderShape = Resources.tower[this.type].resource.shape;
    // this.applyStyle(context);

    // if (renderShape == "ellipse") {
    //   this.drawEllipse(context, this.size, this.position);
    //   return;
    // }
    // if (renderShape == "rectangle") {
    //   this.drawRectangle(context, this.size, this.position);
    // }
    this.drawImage(context, this.size, this.position, this.image);
  }

  applyStyle(context: CanvasRenderingContext2D) {
    context.lineWidth = 1;
    context.strokeStyle = "black";
    const color = Resources.tower[this.type].resource.color;
    context.fillStyle = color;
  }
}

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

export class PathDrawable extends Drawable<Path> {
  public drawPriority: number = 1;
  constructor(public type: string, public nodes: PathNode[]) {
    super();
  }
  draw(context: CanvasRenderingContext2D) {
    this.applyStyle(context);
    this.drawLines(context, this.nodes);
  }

  applyStyle(context: CanvasRenderingContext2D) {
    const color = Resources.path[this.type].resource;
    context.strokeStyle = color;
    context.lineWidth = 50;
  }
}

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
