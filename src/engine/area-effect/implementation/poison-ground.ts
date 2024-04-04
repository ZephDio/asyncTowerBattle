import { Derive } from "@ddd-ts/traits";
import { Ellipse, HitBox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TRenderable } from "../../../shared/traits/drawable";
import { Poisoned } from "../../tower/battle/implementation/battle-yellow-tower";
import { TDrawable } from "../../../shared/traits/tdrawable";

export class PoisonGround extends Derive(TDrawable, TRenderable) {
  type = "poison-ground" as const;
  hitbox: HitBox;
  drawPriority = 5;
  clock = 0;
  constructor(public maxDuration: number, public position: Position, public damage: number, public hooks: BattleArmyHooks) {
    super({});
    this.hitbox = new HitBox([[new Ellipse({ width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]]);
  }

  tick() {
    if (this.clock++ > this.maxDuration) {
      this.hooks.removeAreaEffect(this);
      return;
    }
    const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
    for (const enemy of enemies) {
      enemy.addStatus(new Poisoned(this.damage));
    }
  }

  get size() {
    return {
      width: (this.hitbox.hitShapes[0]?.[0] as Ellipse).rx * 2,
      height: (this.hitbox.hitShapes[0]?.[0] as Ellipse).ry * 2,
    };
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
