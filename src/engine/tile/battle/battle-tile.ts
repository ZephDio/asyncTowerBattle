import { Derive } from "@ddd-ts/traits";
import { BasicPathTile, SlowingPathTile } from "../entity/tile";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Cell, Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { HitBox } from "../../../shared/hitboxes";
import { AnyBattleUnit } from "../../units/recruit/unit-recruit";

export type AnyBattleTile = BasicBattlePathTile | SlowingBattlePathTile;
export class BasicBattlePathTile extends Derive(TDrawable, TRenderable) {
  draw: BasicPathTile["draw"];
  public hitbox: HitBox;

  constructor(pathTile: BasicPathTile, public cell: Cell, public position: Position, private hooks: BattleArmyHooks) {
    super({});
    this.draw = pathTile.draw;
    this.hitbox = pathTile.hitbox;
  }

  public drawPriority = 2;

  tick() {
    return;
  }
}

export class SlowingBattlePathTile extends Derive(TDrawable, TRenderable) {
  draw: SlowingPathTile["draw"];

  private affected: Map<AnyBattleUnit, number> = new Map();
  public hitbox: HitBox;

  constructor(pathTile: SlowingPathTile, public cell: Cell, public position: Position, private hooks: BattleArmyHooks) {
    super({});
    this.draw = pathTile.draw;
    this.hitbox = pathTile.hitbox;
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
