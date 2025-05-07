import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Tower } from "../tower";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTDamageDealer } from "../../../../../shared/traits/engine/damage-dealer";
import { ZappingTowerBlueprint } from "../../blueprint/implementation/zapping-tower-blueprint";
import { ZappingBattleTower } from "../../battle/implementation/battle-zapping-tower";
import { BattleSpark } from "../../../../projectile/battle/implementation/battle-spark";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
export class ZappingTower extends Derive(HTDamageDealer, Tower) {
	attackSpeed = 1.3;

	constructor(
		public cell: Cell,
		public tower: ZappingTowerBlueprint = new ZappingTowerBlueprint({}),
	) {
		super({ damageDealer: tower, imageDrawable: tower, hitboxHolder: tower, descriptor: tower, foodConsumer: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleSpark(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = grid.cellToGrid(this.cell);
		return new ZappingBattleTower(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new ZappingBattleTower(this, hooks, position, cell, orientation);
	}

	get position(): Cell {
		return this.cell;
	}
}
