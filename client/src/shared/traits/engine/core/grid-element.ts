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

	// The centre of the footprint's bounding box, not the average of its cells: an L shaped piece draws its image
	// over the whole box.
	getCenterOffset(orientation: BoardOrientation = BoardOrientation.Normal) {
		const vectorCells = this.getVectorialCells(orientation);
		const xs = vectorCells.map((cell) => cell.x);
		const ys = vectorCells.map((cell) => cell.y);
		return {
			x: (Math.min(...xs) + Math.max(...xs)) / 2,
			y: (Math.min(...ys) + Math.max(...ys)) / 2,
		};
	}

	getCenterPosition(mainCell: Cell, orientation: BoardOrientation = BoardOrientation.Normal) {
		const offset = this.getCenterOffset(orientation);
		return new GridPosition({
			x: (offset.x + mainCell.x + 0.5) * STANDARD_CELL_SIZE,
			y: (offset.y + mainCell.y + 0.5) * STANDARD_CELL_SIZE,
		});
	}

	calculateDefaultVector() {
		const offset = this.getCenterOffset();
		return new GridPosition({
			x: offset.x * STANDARD_CELL_SIZE,
			y: offset.y * STANDARD_CELL_SIZE,
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
