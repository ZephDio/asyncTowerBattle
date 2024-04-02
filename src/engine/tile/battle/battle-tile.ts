import { Derive } from "@ddd-ts/traits";
import { BasicPathTile, SlowingPathTile } from "../entity/tile";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Cell, Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { AnyBattleUnit } from "../../units/recruit/unit-recruit";

export type AnyBattleTile = BasicBattlePathTile | SlowingBattlePathTile;
export class BasicBattlePathTile extends Derive(TDrawable, TRenderable) {
  draw: BasicPathTile["draw"];
  constructor(pathTile: BasicPathTile, public cell: Cell, public position: Position, private hooks: BattleArmyHooks) {
    super({});
    this.draw = pathTile.draw;
  }

  public drawPriority = 2;

  tick() {
    return;
  }
}

export class SlowingBattlePathTile extends Derive(TDrawable, TRenderable) {
  public hitbox = new HitBox([[new HitShape("rectangle", { width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]]);
  draw: SlowingPathTile["draw"];

  private affected: Map<AnyBattleUnit, number> = new Map();

  constructor(pathTile: SlowingPathTile, public cell: Cell, public position: Position, private hooks: BattleArmyHooks) {
    super({});
    this.draw = pathTile.draw;
  }

  public drawPriority = 2;

  tick() {
    const unitsStepping = this.hooks.searchEnemyInArea(this.position, this.hitbox);
    for (const unitStepping of unitsStepping) {
      if ([...this.affected.keys()].includes(unitStepping)) {
        return;
      }
      this.affected.set(unitStepping, unitStepping.speed);
      unitStepping.speed *= 0.5;
    }
    for (const [affected, speed] of this.affected) {
      if (!unitsStepping.includes(affected)) {
        affected.speed = speed;
        this.affected.delete(affected);
      }
    }
  }
}
