// import { Position } from "../../../shared/position";
// import { Size } from "../../../shared/size";
// import { Drawable } from "./drawable";

// export class HoverEffectDrawable extends Drawable {
//   drawPriority: 4;
//   constructor(public position: Position, public size: Size) {
//     super();
//   }

//   applyStyle(ctx: CanvasRenderingContext2D) {
//     ctx.globalAlpha = 0.3;
//     ctx.fillStyle = "yellow";
//   }
//   draw(context: CanvasRenderingContext2D) {
//     this.applyStyle(context);
//     this.drawRectangle(context, this.size, this.position);
//   }
// }
