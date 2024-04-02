import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";

export class Explosion extends Derive(TDrawable, TRenderable) {
  type = "explosion" as const;
  hitbox: HitBox;
  drawPriority = 5;
  constructor(public MaxSize: Size, public position: Position, public damage: number, public hooks: BattleArmyHooks) {
    super({});
    this.hitbox = new HitBox([[new HitShape("ellipse", { width: 1, height: 1 }), new Position({ x: 0, y: 0 })]]);
  }

  tick() {
    const explosionShape = this.hitbox.hitShapes[0]?.[0] || { size: { width: 0, height: 0 } };
    explosionShape.size.width++;
    explosionShape.size.height++;
    if (explosionShape.size.width > this.MaxSize.width) {
      const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
      for (const enemy of enemies) {
        enemy.takeDamage(this.damage);
      }
      this.hooks.removeAreaEffect(this);
    }
  }

  get size() {
    return this.hitbox.hitShapes[0]?.[0]?.size || { width: 0, height: 0 };
  }

  draw(context: CanvasRenderingContext2D, position: Position): void {
    context.strokeStyle = "red";
    context.fillStyle = "transparent";
    context.lineWidth = 11;
    context.globalAlpha = 1;
    const size = this.getCanvasSize(context, this.size.width, this.size.height);
    const canvasPosition = this.getCanvasPosition(context, position);
    this.drawEllipse(context, size, canvasPosition);
  }
}
