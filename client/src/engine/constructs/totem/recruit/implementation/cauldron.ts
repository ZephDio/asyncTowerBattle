import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { CauldronBlueprint } from "../../blueprint/implementation/cauldron-blueprint";
import { BattleCauldron } from "../../battle/implementation/battle-cauldron";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { RecruitCaster } from "../../../../../shared/traits/engine/cast";
import { HTBaseStats } from "../../../../stats/base-stats";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class Cauldron extends Derive(Totem, RecruitBattleStart, RecruitCaster, HTBaseStats) {
	constructor(
		public cell: Cell,
		public blueprint: CauldronBlueprint = new CauldronBlueprint({}),
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
		return new BattleCauldron(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattleCauldron(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.cell;
	}
}
