import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { RecruitCaster } from "../../../../../shared/traits/engine/cast";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { BakeryBlueprint } from "../../blueprint/implementation/bakery-blueprint";
import { BattleBakery } from "../../battle/implementation/battle-bakery";
import { HTBaseStats } from "../../../../stats/base-stats";

export class Bakery extends Derive(Totem, RecruitCaster, HTBaseStats) {
	constructor(
		public cell: Cell,
		public blueprint: BakeryBlueprint = new BakeryBlueprint({}),
	) {
		super({ 
			descriptor: blueprint,
			tagHolder: blueprint,
			imageDrawable: blueprint, 
			hitboxHolder: blueprint, 
			statsHolder: blueprint 
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleBakery(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new BattleBakery(this, hooks, position, cell, orientation);
	}

	get position() {
		return this.cell;
	}
}
