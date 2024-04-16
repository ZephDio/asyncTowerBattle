import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Tower } from "../tower-recruit";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { ZappingTowerBlueprint } from "../../blueprint/implementation/zapping-tower";
import { ZappingBattleTower } from "../../battle/implementation/battle-zapping-tower";
import { BattleSpark } from "../../../projectile/battle/implementation/battle-spark";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
export class ZappingTower extends Derive(HTDamageDealer, Tower) {
	attackSpeed = 1.3;

	constructor(
		public cell: Cell,
		public tower: ZappingTowerBlueprint = new ZappingTowerBlueprint({}),
	) {
		super({ damageDealer: tower, imageDrawable: tower, hitboxHolder: tower, descriptor: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleSpark(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const position = grid.cellToGrid(clone.cell);
		return new ZappingBattleTower(clone, hooks, position, clone.cell);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToGrid(cell);
		return new ZappingBattleTower(clone, hooks, position, cell);
	}

	clone() {
		return new ZappingTower(this.cell.clone(), this.tower);
	}

	get position(): Cell {
		return this.cell;
	}
}
