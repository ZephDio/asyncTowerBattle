import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell } from "../../../../shared/position";
import { WindmillBlueprint } from "../../blueprint/implementation/windmill";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
import { BattleWindmill } from "../../battle/implementation/battle-windmill";
import { FoodTag } from "../../../../shared/traits/engine/tags";

export class Windmill extends Derive(Totem, HTSynergy, FoodTag) {
	constructor(
		public cell: Cell,
		public blueprint: WindmillBlueprint = new WindmillBlueprint({}),
	) {
		super({ descriptor: blueprint, imageDrawable: blueprint, hitboxHolder: blueprint, synergy: blueprint });
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleWindmill(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new BattleWindmill(this, hooks, position, cell, orientation);
	}

	get position() {
		return this.cell;
	}
}
