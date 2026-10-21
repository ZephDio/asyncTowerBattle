import { Cell } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { BattleGrid } from "../../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { Totem } from "../totem";
import { BattleGobelinPortal } from "../../battle/implementation/battle-gobelin-portal";
import { GobelinBlueprint } from "../../../../units/blueprint/implementation/gobelin-blueprint";
import { GobelinPortalBlueprint } from "../../blueprint/implementation/gobelin-portal-blueprint";
export class GobelinPortal extends Derive(Totem, HTSynergy) {
	recruit = new GobelinBlueprint({});
	constructor(
		public cell: Cell,
		public totem: GobelinPortalBlueprint = new GobelinPortalBlueprint({}),
	) {
		super({ 
			synergy: totem, 
			tagHolder: totem,
			imageDrawable: totem, 
			hitboxHolder: totem, 
			descriptor: totem
		});
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BattleGobelinPortal(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new BattleGobelinPortal(this, hooks, position, cell, orientation);
	}

	get position(): Cell {
		return this.cell;
	}
}
