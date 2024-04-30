import { Cell } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnvilBattleTotem } from "../../battle/implementation/battle-orange-totem";
import { BattleGrid } from "../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
import { Totem } from "../totem-recruit";
import { AnvilTotemBlueprint } from "../../blueprint/implementation/anvil-blueprint";
export class AnvilTotem extends Derive(Totem, HTSynergy) {
	constructor(
		public cell: Cell,
		public totem: AnvilTotemBlueprint = new AnvilTotemBlueprint({}),
	) {
		super({ synergy: totem, imageDrawable: totem, hitboxHolder: totem, descriptor: totem });
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new AnvilBattleTotem(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new AnvilBattleTotem(this, hooks, position, cell, orientation);
	}

	get position(): Cell {
		return this.cell;
	}
}
