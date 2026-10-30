import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { WindmillBlueprint } from "../../blueprint/implementation/windmill-blueprint";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { BattleWindmill } from "../../battle/implementation/battle-windmill";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";

export class Windmill extends Derive(Totem, HTSynergy, RecruitBattleStart) {
	constructor(
		public cell: Cell,
		public blueprint: WindmillBlueprint = new WindmillBlueprint({}),
	) {
		super({
			descriptor: blueprint,
			tagHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			synergy: blueprint,
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleWindmill(this, hooks, position, this.cell, "normal");
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattleWindmill(this, hooks, position, cell, "mirrored");
	}

	get position() {
		return this.cell;
	}
}
