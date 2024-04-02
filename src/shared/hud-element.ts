import { Derive } from "@ddd-ts/traits";
import { PercentToReal } from "../renderer/implementation/canvas-renderer";
import { HitBox, HitShape } from "./hitboxes";
import { Position } from "./position";
import { Size } from "./size";
import { TDrawable, TRenderable } from "./traits/drawable";
import { Resources } from "../renderer/resources";

export abstract class HudElement {
  abstract type: string;
  abstract position: Position;
  abstract size: Size;

  abstract hitbox: HitBox;
}

export class StartBattleButton extends Derive(TDrawable,TRenderable) {
  drawPriority: 5;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    context.globalAlpha = 1;
    const image = Resources.hudElement.startBattle.resource.image;
    const canvasPosition = this.getCanvasPosition(context ,position)
    const size  = this.getCanvasSize(context, this.size.width, this.size.height);
    this.drawImage(context, size, canvasPosition, image);
  }
  public type = "startBattle";
  public position = PercentToReal({ x: 50, y: 90 });

  public size = { width: 12, height: 6 };

  public hitbox = new HitBox([[new HitShape("rectangle", this.size), new Position({ x: 0, y: 0 })]]);
}


export class GoldDisplay extends Derive(TDrawable,TRenderable) {
  constructor(public gold : number){
    super({})
  }
  drawPriority: 5;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    context.globalAlpha = 1;
    context.fillStyle = "yellow";
    const image = Resources.hudElement.gold.resource.image;
    const unitPosition = this.getCanvasPosition(context, new Position({ x: position.x - 3.5, y: position.y -1 }));
    const canvasPosition = this.getCanvasPosition(context ,position)
    const size  = this.getCanvasSize(context, this.size.width, this.size.height);
    const text = this.gold.toString();
    const textWidth = context.measureText(text).width;
    context.font = `${size.height}px Arial`;
    context.fillText(text, unitPosition.x - textWidth * text.length , unitPosition.y);
    this.drawImage(context, size, canvasPosition, image);
  }
  public type = "goldDisplay";
  public position = PercentToReal({ x: 8, y: 96 });
  public size = { width: 3, height: 3 };

  public hitbox = new HitBox([[new HitShape("rectangle", this.size), new Position({ x: 0, y: 0 })]]);
}