import { HitBox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/battle-bullet";
import { GreenBattleTower } from "../../battle/implementation/battle.green.tower";
import { GreenTower } from "../../entity/implementation/green-tower";
import { TowerRecruit } from "../tower-recruit";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { AnyBattleUnit } from "../../../units/recruit/unit-recruit";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";

export class GreenTowerRecruit extends Derive(HTDamageDealer, TowerRecruit, HTImageDrawable, TRenderable) {
  attackSpeed = 3;
  hitbox: HitBox;

  constructor(public tower: GreenTower, public cell: Cell) {
    super({ damageDealer: tower, imageDrawable: tower });
    this.hitbox = tower.hitbox;
  }

  getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: Position, damage: number) {
    return new BattleBulletProjectile(this.tower.projectile, position.clone(), hooks, target, damage);
  }

  toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const position = grid.cellToReal(clone.cell);
    return new GreenBattleTower(clone, hooks, position, clone.cell);
  }

  toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const cell = BattleGrid.flip(grid, clone.cell);
    const position = grid.cellToReal(cell);
    return new GreenBattleTower(clone, hooks, position, cell);
  }

  clone() {
    return new GreenTowerRecruit(new GreenTower({}), this.cell);
  }

  get position(): Cell {
    return this.cell;
  }
}
