import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { CornFieldBlueprint } from "../../blueprint/implementation/corn-field-blueprint";
import { BattleCornField } from "../../battle/implementation/battle-corn-field";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class CornField extends Derive(Totem, RecruitBattleStart) {
	constructor(
		public cell: Cell,
		public blueprint: CornFieldBlueprint = new CornFieldBlueprint({}),
	) {
		super({
			descriptor: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleCornField(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattleCornField(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.cell;
	}
}
