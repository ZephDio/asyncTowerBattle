import { ImplementsTrait } from "@ddd-ts/traits";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { Cell } from "../../shared/position";
import { Physic } from "../../shared/physic";

export class PatternEffect {
	constructor(
		public relativeCells: Cell[],
		public patternCondition: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean,
	) {}

	getRelativeCells(orientation: number) {
		return this.relativeCells.map((cell) => {
			return Physic.getProjectionCellsFromOrientation(cell, orientation);
		});
	}
}
