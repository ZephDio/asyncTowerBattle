import { Derive } from "@ddd-ts/traits";
import { ElfCastleBlueprint } from "../../blueprint/elf-castle-blueprint";
import { Cell } from "../../../../shared/position";
import { FoodHooks } from "../../../food/battle-food-economy";
import { BattleElfCastle } from "../../battle/battle-elf-castle";
import { BattleGrid } from "../../../grid/battle-grid";
import { Castle } from "../castle-recruit";

export class ElfCastle extends Derive(Castle) {
	constructor(
		castle: ElfCastleBlueprint,
		public cell: Cell,
	) {
		super({ imageDrawable: castle, hitboxHolder: castle, descriptor: castle, statsHolder: castle });
	}

	toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle {
		const position = grid.cellToGrid(this.cell);
		return new BattleElfCastle(this, onDeath, this.cell.clone(), position, this.orientation, foodHooks);
	}

	toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		const BC = new BattleElfCastle(this, onDeath, cell, position, orientation, foodHooks);
		return BC;
	}
}
