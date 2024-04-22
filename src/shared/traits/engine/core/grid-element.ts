import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";

import { Cell, GridPosition } from "../../../position";
import { STANDARD_CELL_SIZE, TGrid } from "../../../../engine/grid/tgrid";
import { TRenderable } from "../../render/renderable";
import { Physic } from "../../../physic";
import { HTImageDrawable } from "../../render/image-drawable";

export class GridShape {
	constructor(public cells: Cell[] = [new Cell({ x: 0, y: 0 })]) {}

	getVectorialCells(orientation: number) {
		return this.cells.map((cell) => {
			return Physic.getProjectionCellsFromOrientation(cell, orientation);
		});
	}
	getOccupiedCellsFrom(cell: Cell, orientation: number) {
		return this.getVectorialCells(orientation).map((c) => c.add(cell));
	}

	getCenterPosition(mainCell: Cell, orientation: number) {
		const vectorCells = this.getVectorialCells(orientation);
		const acc = vectorCells.reduce((acc, cell) => acc.add(cell), new Cell({ x: 0, y: 0 }));

		const x = acc.x / this.cells.length + mainCell.x;
		const y = acc.y / this.cells.length + mainCell.y;

		return new GridPosition({
			x: (x + 0.5) * STANDARD_CELL_SIZE,
			y: (y + 0.5) * STANDARD_CELL_SIZE,
		});
	}
}

export const GridElement = Subtrait([TRenderable], (base) => {
	abstract class IGridElement extends base {
		gridShape: GridShape = new GridShape();

		orientation = 3*Math.PI/2;
		abstract cell: Cell;

		setOrientation(orientation: number) {
			this.orientation = orientation;
			if (implementsTrait(this, HTImageDrawable)) {
				this.angle = orientation;
			}
		}
		getRealPosition(grid: ImplementsTrait<typeof TGrid>) {
			return grid.cellToGrid(this.cell);
		}
	}
	return IGridElement;
});
