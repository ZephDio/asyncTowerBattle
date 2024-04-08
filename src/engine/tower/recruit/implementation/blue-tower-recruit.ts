import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleRocket } from "../../../projectile/battle/implementation/battle-rocket";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTowerBlueprint } from "../../blueprint/implementation/blue-tower";
import { Tower } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";

import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";

export class BlueTower extends Derive(HTDamageDealer, Tower) {
	attackSpeed = 1.2;

	constructor(
		public cell: Cell,
		public tower: BlueTowerBlueprint = new BlueTowerBlueprint({}),
	) {
		super({ imageDrawable: tower, damageDealer: tower, hitboxHolder: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: Position, damage: number) {
		return new BattleRocket(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const position = grid.cellToReal(clone.cell);
		return new BlueBattleTower(clone, hooks, position, clone.cell);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToReal(cell);
		return new BlueBattleTower(clone, hooks, position, cell);
	}

	clone() {
		return new BlueTower(this.cell.clone(), this.tower);
	}

	get position(): Cell {
		return this.cell;
	}
}
