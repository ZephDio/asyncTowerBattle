import { HitBox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { TowerRecruit } from "../tower-recruit";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { YellowTower } from "../../entity/implementation/yellow-tower";
import { YellowBattleTower } from "../../battle/implementation/battle-yellow-tower";
import { PoisonGround } from "../../../area-effect/implementation/poison-ground";
import { HTSynergy } from "../../../../shared/traits/synergy";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";

export class YellowTowerRecruit extends Derive(HTDamageDealer, TowerRecruit, HTSynergy, HTImageDrawable, TRenderable) {
  attackSpeed = 0.8;
  hitbox: HitBox;

  constructor(public tower: YellowTower, public cell: Cell) {
    super({ synergy: tower, damageDealer: tower, imageDrawable: tower });
    this.hitbox = tower.hitbox;
  }

  getAreaEffect(hooks: BattleArmyHooks, position: Position, damage: number) {
    return new PoisonGround(80, position, damage, hooks);
  }

  toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const position = grid.cellToReal(clone.cell);
    return new YellowBattleTower(clone, hooks, position, clone.cell);
  }

  toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const cell = BattleGrid.flip(grid, clone.cell);
    const position = grid.cellToReal(cell);
    return new YellowBattleTower(clone, hooks, position, cell);
  }

  clone() {
    return new YellowTowerRecruit(new YellowTower({}), this.cell);
  }

  get position(): Cell {
    return this.cell;
  }
}
