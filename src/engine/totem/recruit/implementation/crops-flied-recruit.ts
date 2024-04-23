import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem-recruit";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { CropsFieldBlueprint } from "../../blueprint/implementation/crops-field";
import { BattleGrid } from "../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell } from "../../../../shared/position";
import { BattleCropsField } from "../../battle/implementation/battle-crops-field";
import { FoodTag } from "../../../../shared/traits/engine/tags";

export class CropsField extends Derive(Totem, RecruitCaster,FoodTag) {
	castSpeed = 3;
	constructor(
		public cell: Cell,
		public blueprint: CropsFieldBlueprint = new CropsFieldBlueprint({}),
	) {
		super({ descriptor: blueprint, imageDrawable: blueprint, hitboxHolder: blueprint });
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleCropsField(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new BattleCropsField(this, hooks, position, cell, orientation);
	}

	get position() {
		return this.cell;
	}
}
