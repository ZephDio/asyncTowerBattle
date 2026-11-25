import { Cell, GridPosition } from "../../shared/position";
import { BoardOrientation } from "../../shared/traits/engine/core/board-orientation";
import { DWARF_CASTLE_LAYOUT, STANDARD_CELL_SIZE } from "../grid/grid-scale";

// The sprite overhangs the carpet slightly; neither doorway moves with the art.

export type CastleGeometry = {
	// Centre of the sprite, where the castle is drawn.
	position: GridPosition;
	// Where the enemy units arrive: the middle of the anchor cell's outer edge.
	doorPosition: GridPosition;
	// Where the castle's own units spawn: the middle of the outer edge of the opponent's cell next to it.
	spawnPosition: GridPosition;
};

// `anchor` is the anchor cell in the frame being built: the army grid's for an allied castle (width and height don't
// matter), the battle grid's for an enemy one, and `boardWidth` is the width of the boards.
export const castleGeometry = (
	anchor: Cell,
	orientation: BoardOrientation,
	boardWidth: number,
	layout = DWARF_CASTLE_LAYOUT,
): CastleGeometry => {
	const S = STANDARD_CELL_SIZE;
	const inset = layout.width / 2 - layout.overlap;
	if (orientation === BoardOrientation.Normal) {
		return {
			position: new GridPosition({ x: -inset * S, y: (anchor.y + 1 + layout.lift) * S }),
			doorPosition: new GridPosition({ x: 0, y: (anchor.y + 0.5) * S }),
			spawnPosition: new GridPosition({ x: 0, y: (anchor.y + 1.5) * S }),
		};
	}
	// The block rises from the anchor cell's row on the mirrored board, so it centres on the anchor row's bottom edge.
	return {
		position: new GridPosition({ x: (boardWidth + inset) * S, y: (anchor.y + layout.lift) * S }),
		doorPosition: new GridPosition({ x: boardWidth * S, y: (anchor.y + 0.5) * S }),
		spawnPosition: new GridPosition({ x: boardWidth * S, y: (anchor.y - 0.5) * S }),
	};
};
