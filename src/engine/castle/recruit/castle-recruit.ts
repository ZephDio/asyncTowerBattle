import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { CastleBlueprint } from "../blueprint/castle";
import { BattleCastle } from "../battle/battle-castle";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { TokenHooks } from "../../shop/holder/holder";

export class Castle<TB extends CastleBlueprint = CastleBlueprint> extends Derive(TRecruit) {
	maxLife: number;

	constructor(
		castle: TB,
		public cell: Cell,
	) {
		super({ imageDrawable: castle, hitboxHolder: castle, descriptor: castle });
		this.maxLife = castle.maxLife;
	}

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, onDeath: () => void): BattleCastle {
		const position = grid.cellToGrid(this.cell);
		return new BattleCastle(this, onDeath, this.cell, position, this.orientation);
	}

	toEnemy(grid: BattleGrid, onDeath: () => void): BattleCastle {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		const BC = new BattleCastle(this, onDeath, cell, position, orientation);
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
