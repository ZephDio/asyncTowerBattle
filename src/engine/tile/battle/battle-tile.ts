import { Derive } from "@ddd-ts/traits";
import { BasicPathTile, SlowingPathTile } from "../entity/tile";
import { HTImageDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Cell, Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { HitBox } from "../../../shared/hitboxes";
import { AnyBattleUnit } from "../../units/recruit/unit-recruit";
import { GridElement } from "../../grid/grid";

export type AnyBattleTile = BasicBattlePathTile | SlowingBattlePathTile;

export class BasicBattlePathTile extends Derive(GridElement, TRenderable, HTImageDrawable) {
  public hitbox: HitBox;

  constructor(pathTile: BasicPathTile, public cell: Cell, public position: Position, _hooks: BattleArmyHooks) {
    super({ imageDrawable: pathTile });
    this.hitbox = pathTile.hitbox;
  }

  tick() {
    return;
  }
}

export class SlowingBattlePathTile extends Derive(TRenderable, HTImageDrawable) {
  private affected: Map<AnyBattleUnit, number> = new Map();
  public hitbox: HitBox;

  constructor(pathTile: SlowingPathTile, public cell: Cell, public position: Position, private hooks: BattleArmyHooks) {
    super({ imageDrawable: pathTile });
    this.hitbox = pathTile.hitbox;
  }

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
