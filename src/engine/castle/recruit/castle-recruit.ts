import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../shared/hitboxes";
import { Cell, Position } from "../../../shared/position";
import { ArmyGrid, GridElement } from "../../grid/grid";
import { HTImageDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Castle } from "../entity/castle";
import { BattleCastle } from "../battle/battle-castle";
import { BattleGrid } from "../../grid/battle-grid";

export class CastleRecruit<TB extends Castle> extends Derive(HTHitbox, HTImageDrawable, TRenderable, GridElement) {
	type: string = "castle";
	cell: Cell;
	maxLife: number;

	constructor(castle: TB) {
		super({ imageDrawable: castle, hitboxHolder: castle });
		this.cell = new Cell({ x: 12, y: 5 });
		this.maxLife = castle.maxLife;
	}

	clone() {
		// TODO
		return new CastleRecruit(new Castle({}));
	}

	get position() {
		return this.cell;
	}

	toSerialized(grid: ArmyGrid): SerializedCastleRecruit {
		return {
			type: this.type,
			cell: this.cell,
			position: grid.cellToReal(this.cell),
		};
	}

	toAllied(grid: BattleGrid, onDeath: () => void): BattleCastle {
		const clone = this.clone();
		const position = grid.cellToReal(clone.cell);
		return new BattleCastle(clone, onDeath, clone.cell, position);
	}

	toEnemy(grid: BattleGrid, onDeath: () => void): BattleCastle {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToReal(cell);
		console.log(cell);
		const BC = new BattleCastle(clone, onDeath, cell, position);
		console.log(BC.cell);
		return BC;
	}
}

export type SerializedCastleRecruit = {
	type: string;
	cell: Cell;
	position: Position;
};
