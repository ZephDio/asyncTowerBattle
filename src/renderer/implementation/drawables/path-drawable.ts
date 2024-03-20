import { Path, PathNode } from "../../../engine/path/domain/path";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

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
