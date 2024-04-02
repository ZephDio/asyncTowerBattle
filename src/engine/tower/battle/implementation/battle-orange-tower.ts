import { Derive } from "@ddd-ts/traits";
import { TPhysics } from "../../../../shared/traits/physics";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { BlueBattleTower } from "./battle-blue-tower";
import { GreenBattleTower } from "./battle.green.tower";
import { TDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { YellowBattleTower } from "./battle-yellow-tower";

export class OrangeBattleTower extends Derive(TPhysics, TDrawable, TRenderable) {
  hasTriggered = false;
  draw: OrangeTowerRecruit["draw"];
  drawPriority = 3;

  constructor(
    private readonly recruit: OrangeTowerRecruit,
    readonly hooks: BattleArmyHooks,
    public readonly position: Position,
    public readonly cell: Cell
  ) {
    super({});
    this.draw = this.recruit.draw;
  }

  get realPosition(): Position {
    return this.position;
  }

  tick() {
    if (!this.hasTriggered) {
      const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(this.cell, [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })]);
      for (const neighbor of neighbors) {
        if (neighbor instanceof BlueBattleTower || neighbor instanceof GreenBattleTower || neighbor instanceof YellowBattleTower) {
          neighbor.attackDamage += 20;
        }
      }
      this.hasTriggered = true;
    }
  }

  isAlive(): boolean {
    return true;
  }

  takeDamage(_damage: number): void {
    return;
  }
}
