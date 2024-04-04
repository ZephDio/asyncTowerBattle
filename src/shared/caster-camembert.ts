import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "./traits/tdrawable";
import { Position } from "./position";
import { Caster } from "./traits/cast";

export class CasterCamembert extends Derive(TDrawable) {
  objective = 100;
  constructor(public caster: ImplementsTrait<typeof Caster>) {
    super({});
  }

  drawPriority = 5;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    if (!this.caster.cast) return;
    context.globalAlpha = 1;
    const size = this.getCanvasSize(context, 2, 2);
    const canvasPosition = this.getCanvasPosition(context, position);
    context.strokeStyle = "black";
    //this.drawLine(context,canvasPosition.x,canvasPosition.y, canvasPosition.x +35, canvasPosition.y+35)
    this.drawArc(context, canvasPosition.x, canvasPosition.y, size, this.caster.cast.progress / this.objective);
  }
}
