import { Cell, GridPosition } from "../../shared/position";
import { BoardOrientation } from "../../shared/traits/engine/core/board-orientation";
import { STANDARD_CELL_SIZE } from "../grid/tgrid";

// The castle is not on the grid. It stands off the board, as a 2x2 block of cells beside the top row, left of the top
// left cell (the castle's anchor cell, where the path ends). The block has two doors on the board's left edge: the
// lower one is the anchor cell's left edge, where the enemy units arrive; the upper one is the left edge of the cell
// above, which belongs to the opponent's board, where the castle's own units spawn and enter it.
// On the opponent's board the block is mirrored through the centre of the battle grid: right of the top right cell.
export const CASTLE_BLOCK_CELLS = 2;

export type CastleGeometry = {
	// Centre of the 2x2 block, where the castle is drawn.
	position: GridPosition;
	// Where the enemy units arrive: the middle of the anchor cell's outer edge.
	doorPosition: GridPosition;
	// Where the castle's own units spawn: the middle of the outer edge of the opponent's cell next to it.
	spawnPosition: GridPosition;
};

// `anchor` is the anchor cell in the frame being built: the army grid's for an allied castle (width and height don't
// matter), the battle grid's for an enemy one, and `boardWidth` is the width of the boards.
export const castleGeometry = (anchor: Cell, orientation: BoardOrientation, boardWidth: number): CastleGeometry => {
	// Read here, not at the module's load: this module and the grid import each other.
	const S = STANDARD_CELL_SIZE;
	if (orientation === BoardOrientation.Normal) {
		return {
			position: new GridPosition({ x: -S, y: (anchor.y + 1) * S }),
			doorPosition: new GridPosition({ x: 0, y: (anchor.y + 0.5) * S }),
			spawnPosition: new GridPosition({ x: 0, y: (anchor.y + 1.5) * S }),
		};
	}
	// The block rises from the anchor cell's row on the mirrored board, so it centres on the anchor row's bottom edge.
	return {
		position: new GridPosition({ x: (boardWidth + 1) * S, y: anchor.y * S }),
		doorPosition: new GridPosition({ x: boardWidth * S, y: (anchor.y + 0.5) * S }),
		spawnPosition: new GridPosition({ x: boardWidth * S, y: (anchor.y - 0.5) * S }),
	};
};
