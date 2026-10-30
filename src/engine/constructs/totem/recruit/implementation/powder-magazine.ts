import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { PowderMagazineBlueprint } from "../../blueprint/implementation/powder-magazine-blueprint";
import { BattlePowderMagazine } from "../../battle/implementation/battle-powder-magazine";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class PowderMagazine extends Derive(Totem, RecruitBattleStart) {
	constructor(
		public cell: Cell,
		public blueprint: PowderMagazineBlueprint = new PowderMagazineBlueprint({}),
	) {
		super({
			descriptor: blueprint,
			tagHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattlePowderMagazine(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattlePowderMagazine(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.cell;
	}
}
