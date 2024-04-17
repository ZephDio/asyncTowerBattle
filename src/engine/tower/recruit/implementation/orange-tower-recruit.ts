import { Cell } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTowerBlueprint } from "../../blueprint/implementation/orange-tower";
import { Tower } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
export class OrangeTower extends Derive(Tower, HTSynergy) {
	constructor(
		public cell: Cell,
		public tower: OrangeTowerBlueprint = new OrangeTowerBlueprint({}),
	) {
		super({ synergy: tower, imageDrawable: tower, hitboxHolder: tower, descriptor: tower });
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = grid.cellToGrid(this.cell);
		return new OrangeBattleTower(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new OrangeBattleTower(this, hooks, position, cell, orientation);
	}

	get position(): Cell {
		return this.cell;
	}
}
