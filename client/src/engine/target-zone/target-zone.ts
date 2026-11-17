import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { BoardOrientation, orientCell } from "../../shared/traits/engine/core/board-orientation";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { PathTile } from "../tile/recruit/tile";

// The cells, relative to a tower's anchor cell, where the tower finds its targets. Enemies only walk on path tiles,
// so a target cell only matters when it holds one.
export class TargetZone {
	constructor(public relativeCells: Cell[]) {}

	getRelativeCells(orientation: BoardOrientation) {
		return this.relativeCells.map((cell) => orientCell(cell, orientation));
	}

	isTargetable(gridElement: ImplementsTrait<typeof GridElement> | undefined) {
		return gridElement !== undefined && implementsTrait(gridElement, PathTile);
	}

	// The 8 cells around a one-cell tower.
	static around() {
		const cells: Cell[] = [];
		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				if (x !== 0 || y !== 0) cells.push(new Cell({ x, y }));
			}
		}
		return new TargetZone(cells);
	}

	// A straight line of cells going down from `from`, up to `length` cells.
	static columnBelow(from: Cell, length: number) {
		return new TargetZone(Array.from({ length }, (_, i) => new Cell({ x: from.x, y: from.y - i })));
	}
}
