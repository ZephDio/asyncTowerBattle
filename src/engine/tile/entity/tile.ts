import { Derive } from "@ddd-ts/traits";
import { TDrawable, TImageDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Cell, Position } from "../../../shared/position";
import { Resources } from "../../../renderer/resources";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BasicBattlePathTile, SlowingBattlePathTile } from "../battle/battle-tile";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { GridElement } from "../../grid/grid";

export type AnyPathTile = BasicPathTile | SlowingPathTile;

export class BasicPathTile extends Derive(
  GridElement,
  TDrawable,
  TRenderable,
  TImageDrawable(Resources.path.normal.image, { width: 4.9, height: 4.9 }, 2)
) {
  public hitbox = new HitBox([[new HitShape("rectangle", { width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]]);
  constructor(public cell: Cell) {
    super({});
  }

  get position() {
    return this.cell;
  }

  toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
    return new BasicBattlePathTile(this, cell, position, hooks);
  }
}

export class SlowingPathTile extends Derive(
  TDrawable,
  TRenderable,
  TImageDrawable(Resources.path.slowing.image, { width: 4.9, height: 4.9 }, 2)
) {
  public hitbox = new HitBox([[new HitShape("rectangle", { width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]]);

  constructor(public cell: Cell) {
    super({});
  }

  get position() {
    return this.cell;
  }

  toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
    return new SlowingBattlePathTile(this, cell, position, hooks);
  }
}
