import { BattleVerdict } from "../../../engine/battle-summary/battle-summary";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class VerdictDrawable extends Drawable<BattleVerdict> {
  drawPriority: number = 2;
  image: HTMLImageElement;
  constructor(
    public verdict: BattleVerdict,
    public size: Size,
    public position: Position
  ) {
    super();
    this.image = new Image(size.width, size.height);
    this.image.src = Resources.verdict[verdict].resource.src;
  }
  draw(context: CanvasRenderingContext2D) {
    this.drawImage(context, this.size, this.position, this.image);
  }
}
