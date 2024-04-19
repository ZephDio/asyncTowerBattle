import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleRocket } from "../../../projectile/battle/implementation/battle-rocket";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTowerBlueprint } from "../../blueprint/implementation/blue-tower";
import { Tower } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";

import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";

export class BlueTower extends Derive(HTDamageDealer, Tower) {
	attackSpeed = 1.2;

	constructor(
		public cell: Cell,
		public tower: BlueTowerBlueprint = new BlueTowerBlueprint({}),
	) {
		super({ imageDrawable: tower, damageDealer: tower, hitboxHolder: tower, descriptor: tower, foodConsumer: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleRocket(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = grid.cellToGrid(this.cell);
		return new BlueBattleTower(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new BlueBattleTower(this, hooks, position, cell, orientation);
	}

	get position(): Cell {
		return this.cell;
	}
}
