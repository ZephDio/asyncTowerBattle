import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../position";
import { STANDARD_CELL_SIZE, TGrid } from "../../../../engine/grid/tgrid";
import { TRenderable } from "../../render/renderable";
import { BoardOrientation, TBoardOriented, orientCell } from "./board-orientation";

export class GridShape {
	defaultVector: GridPosition;
	constructor(public cells: Cell[] = [new Cell({ x: 0, y: 0 })]) {
		this.defaultVector = this.calculateDefaultVector();
	}

	getVectorialCells(orientation: BoardOrientation = BoardOrientation.Normal) {
		return this.cells.map((cell) => orientCell(cell, orientation));
	}
	getOccupiedCellsFrom(cell: Cell, orientation: BoardOrientation = BoardOrientation.Normal) {
		return this.getVectorialCells(orientation).map((c) => c.add(cell));
	}

	getCenterPosition(mainCell: Cell, orientation: BoardOrientation = BoardOrientation.Normal) {
		const vectorCells = this.getVectorialCells(orientation);
		const acc = vectorCells.reduce((acc, cell) => acc.add(cell), new Cell({ x: 0, y: 0 }));

		const x = acc.x / this.cells.length + mainCell.x;
		const y = acc.y / this.cells.length + mainCell.y;

		return new GridPosition({
			x: (x + 0.5) * STANDARD_CELL_SIZE,
			y: (y + 0.5) * STANDARD_CELL_SIZE,
		});
	}

	calculateDefaultVector() {
		const acc = this.cells.reduce((acc, cell) => acc.add(cell), new Cell({ x: 0, y: 0 }));
		const average = acc.divideBy(this.cells.length);
		return new GridPosition({
			x: average.x * STANDARD_CELL_SIZE,
			y: average.y * STANDARD_CELL_SIZE,
		});
	}

	// Recruits are never mirrored, so the anchor is the grabbed position minus the shape's centre offset.
	getDefaultTilePositionFromGridPosition(gridPosition: GridPosition) {
		return new GridPosition({
			x: gridPosition.x - this.defaultVector.x,
			y: gridPosition.y - this.defaultVector.y,
		});
	}
}

export const GridElement = Subtrait([TRenderable, TBoardOriented], (base) => {
	abstract class IGridElement extends base {
		gridShape: GridShape = new GridShape();

		abstract cell: Cell;

		getRealPosition(grid: ImplementsTrait<typeof TGrid>) {
			return grid.cellToGrid(this.cell);
		}
	}
	return IGridElement;
});
