import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";

import { Cell, GridPosition } from "../../../position";
import { STANDARD_CELL_SIZE, TGrid } from "../../../../engine/grid/tgrid";
import { TRenderable } from "../../render/renderable";

export class GridShape {
	constructor(public cells: Cell[] = [new Cell({ x: 0, y: 0 })]) {}

	getOccupiedCellsFrom(cell: Cell) {
		return this.cells.map((c) => c.add(cell));
	}

	getCenterPosition(mainCell: Cell) {
		const acc = this.cells.reduce((acc, cell) => acc.add(cell), new Cell({ x: 0, y: 0 }));

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
		abstract cell: Cell;

		getRealPosition(grid: ImplementsTrait<typeof TGrid>) {
			return grid.cellToGrid(this.cell);
		}
	}
	return IGridElement;
});
