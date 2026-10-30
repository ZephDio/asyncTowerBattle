import { Cell } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { AnvilBattleTotem } from "../../battle/implementation/battle-anvil";
import { BattleGrid } from "../../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { Totem } from "../totem";
import { AnvilTotemBlueprint } from "../../blueprint/implementation/anvil-blueprint";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
export class AnvilTotem extends Derive(Totem, HTSynergy, RecruitBattleStart) {
	constructor(
		public cell: Cell,
		public totem: AnvilTotemBlueprint = new AnvilTotemBlueprint({}),
	) {
		super({
			synergy: totem,
			tagHolder: totem,
			imageDrawable: totem,
			hitboxHolder: totem,
			descriptor: totem,
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new AnvilBattleTotem(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new AnvilBattleTotem(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position(): Cell {
		return this.cell;
	}
}
