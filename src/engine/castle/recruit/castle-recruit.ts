import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../shared/position";
import { CastleBlueprint } from "../blueprint/castle";
import { BattleCastle } from "../battle/battle-castle";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { TokenHooks } from "../../shop/holder/holder";
import { FoodHooks } from "../../food/battle-food-economy";
import { RecruitCaster } from "../../../shared/traits/engine/cast";

export class Castle extends Derive(TRecruit, RecruitCaster) {
	maxLife: number;
	castSpeed: number;
	constructor(
		castle: CastleBlueprint,
		public cell: Cell,
	) {
		super({ imageDrawable: castle, hitboxHolder: castle, descriptor: castle });
		this.maxLife = castle.maxLife;
		this.castSpeed = castle.castSpeed;
	}

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleCastle {
		const position = grid.cellToGrid(this.cell);
		return new BattleCastle(this, onDeath, this.cell.clone(), position, this.orientation, foodHooks);
	}

	toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleCastle {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		const BC = new BattleCastle(this, onDeath, cell, position, orientation, foodHooks);
		return BC;
	}

	moveRecruit(_hooks: TokenHooks, _position: GridPosition): void {
		throw new Error("Cannot move castle");
	}
}

export type SerializedCastleRecruit = {
	type: string;
	cell: Cell;
	position: GridPosition;
};
