import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { RecruitCaster } from "../../../../../shared/traits/engine/cast";
import { CropsFieldBlueprint } from "../../blueprint/implementation/crops-field-blueprint";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { BattleCropsField } from "../../battle/implementation/battle-crops-field";
import { HTBaseStats } from "../../../../stats/base-stats";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class CropsField extends Derive(Totem, RecruitCaster, HTBaseStats) {
	constructor(
		public cell: Cell,
		public blueprint: CropsFieldBlueprint = new CropsFieldBlueprint({}),
	) {
		super({
			descriptor: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			statsHolder: blueprint,
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleCropsField(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattleCropsField(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.cell;
	}
}
