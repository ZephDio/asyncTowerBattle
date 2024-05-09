import { Derive } from "@ddd-ts/traits";
import { Cell } from "../../../../shared/position";
import { FoodHooks } from "../../../food/battle-food-economy";
import { BattleElfCastle } from "../../battle/battle-elf-castle";
import { BattleGrid } from "../../../grid/battle-grid";
import { Castle } from "../castle-recruit";
import { DwarfCastleBlueprint } from "../../blueprint/dwarf-castle-blueprint";
import { BattleDwarfCastle } from "../../battle/battle-dwarf-castle";

export class DwarfCastle extends Derive(Castle) {
	constructor(
		castle: DwarfCastleBlueprint,
		public cell: Cell,
	) {
		super({ imageDrawable: castle, hitboxHolder: castle, descriptor: castle });
		this.maxLife = castle.maxLife;
		this.castSpeed = castle.castSpeed;
	}

	toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle {
		const position = grid.cellToGrid(this.cell);
		return new BattleDwarfCastle(this, onDeath, this.cell.clone(), position, this.orientation, foodHooks);
	}

	toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation - Math.PI;
		const battleCastle = new BattleDwarfCastle(this, onDeath, cell, position, orientation, foodHooks);
		return battleCastle;
	}
}
