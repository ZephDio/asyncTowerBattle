import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../shared/hitboxes";
import { Cell, Position } from "../../../shared/position";
import { Grid, GridElement } from "../../grid/grid";
import { HTImageDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Castle } from "../entity/castle";

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

	toSerialized(grid: Grid): SerializedCastleRecruit {
		return {
			type: this.type,
			cell: this.cell,
			position: grid.cellToReal(this.cell),
		};
	}
}

export type SerializedCastleRecruit = {
	type: string;
	cell: Cell;
	position: Position;
};
