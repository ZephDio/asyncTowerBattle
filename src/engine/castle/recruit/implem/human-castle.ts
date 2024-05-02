import { Derive } from "@ddd-ts/traits";
import { HumanCastleBlueprint } from "../../blueprint/human-castle-blueprint";
import { Cell } from "../../../../shared/position";
import { FoodHooks } from "../../../food/battle-food-economy";
import { BattleHumanCastle } from "../../battle/battle-human-castle";
import { BattleGrid } from "../../../grid/battle-grid";
import { Castle } from "../castle-recruit";


export class HumanCastle extends Derive(Castle){

	constructor(
		castle: HumanCastleBlueprint,
		public cell: Cell,
	) {
		super({ imageDrawable: castle, hitboxHolder: castle, descriptor: castle });
		this.maxLife = castle.maxLife;
		this.castSpeed = castle.castSpeed;
	}

	toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleHumanCastle {
		const position = grid.cellToGrid(this.cell);
		return new BattleHumanCastle(this, onDeath, this.cell.clone(), position, this.orientation, foodHooks);
	}

	toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleHumanCastle {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		const BC = new BattleHumanCastle(this, onDeath, cell, position, orientation, foodHooks);
		return BC;
	}

}
