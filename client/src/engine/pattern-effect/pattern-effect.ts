import { ImplementsTrait } from "@ddd-ts/traits";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { Cell } from "../../shared/position";
import { BoardOrientation, orientCell } from "../../shared/traits/engine/core/board-orientation";

export class PatternEffect {
	constructor(
		public relativeCells: Cell[],
		public patternCondition: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean,
	) {}

	getRelativeCells(orientation: BoardOrientation) {
		return this.relativeCells.map((cell) => orientCell(cell, orientation));
	}
}
