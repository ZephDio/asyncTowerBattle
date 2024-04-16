import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleBullet } from "../../../projectile/battle/implementation/battle-bullet";
import { GreenBattleTower } from "../../battle/implementation/battle.green.tower";
import { GreenTowerBlueprint } from "../../blueprint/implementation/green-tower";
import { Tower } from "../tower-recruit";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";

export class GreenTower extends Derive(HTDamageDealer, Tower) {
	attackSpeed = 3;

	constructor(
		public cell: Cell,
		public tower: GreenTowerBlueprint = new GreenTowerBlueprint({}),
	) {
		super({ damageDealer: tower, imageDrawable: tower, hitboxHolder: tower, descriptor: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleBullet(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const position = grid.cellToGrid(clone.cell);
		return new GreenBattleTower(clone, hooks, position, clone.cell);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToGrid(cell);
		return new GreenBattleTower(clone, hooks, position, cell);
	}

	clone() {
		return new GreenTower(this.cell.clone(), this.tower);
	}

	get position(): Cell {
		return this.cell;
	}
}
