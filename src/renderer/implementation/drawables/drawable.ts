import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";

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
    image: HTMLImageElement,
    theta: number | undefined = undefined
  ) {
    if (theta) {
      context.translate(position.x, position.y)
      context.rotate(-theta) // canvas rotate clockwise
      context.drawImage(image,
        -size.width / 2,
        -size.height / 2,
        size.width,
        size.height)
      return
    }
    context.drawImage(
      image,
      position.x - size.width / 2,
      position.y - size.height / 2,
      size.width,
      size.height
    );
  }
}
