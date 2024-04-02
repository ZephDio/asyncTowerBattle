import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";

export class PoisonGround extends Derive(TDrawable, TRenderable) {
  type = "explosion" as const;
  hitbox: HitBox;
  drawPriority = 5;
  duration = 0
  constructor(public maxDuration: number, public position: Position, public damage: number, public hooks: BattleArmyHooks) {
    super({});
    this.hitbox = new HitBox([[new HitShape("ellipse", { width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]]);
  }

  tick() {
    if (this.duration++ > this.maxDuration) {
      this.hooks.removeAreaEffect(this);
      return
    }
    const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
    for (const enemy of enemies) {
      console.log(this.damage/32)
       enemy.takeDamage(this.damage/32);
    }
  }

  get size() {
    return this.hitbox.hitShapes[0]?.[0]?.size || { width: 0, height: 0 };
  }

  draw(context: CanvasRenderingContext2D, position: Position): void {
    context.globalAlpha = 0.18;

    context.strokeStyle = "purple";
    context.fillStyle = "purple";
    context.lineWidth = 11;
    const size = this.getCanvasSize(context, this.size.width, this.size.height);
    const canvasPosition = this.getCanvasPosition(context, position);
    this.drawEllipse(context, size, canvasPosition);
  }
}
