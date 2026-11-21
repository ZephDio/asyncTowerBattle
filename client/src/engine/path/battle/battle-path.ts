import { Cell, GridPosition } from "../../../shared/position";
import { AnyBattleCastle } from "../../castle/battle";
import { BattleGrid } from "../../grid/battle-grid";
// The route the units of an army follow to the castle of the army the path belongs to (`alliedCastle`). They spawn at
// the other castle's spawn point (`enemyCastle`), on the outer edge of this path's first cell (the board's door cell),
// walk this path, and leave its last cell through its outer edge, the door of `alliedCastle`.
export class BattlePath {
	constructor(
		public pathTileNodes: GridPosition[],
		public alliedCastle: AnyBattleCastle,
		public enemyCastle: AnyBattleCastle,
	) {}

	getNodes() {
		return [...this.pathTileNodes, this.alliedCastle.doorPosition];
	}

	static toAllied(grid: BattleGrid, cells: Cell[], alliedCastle: AnyBattleCastle, enemyCastle: AnyBattleCastle) {
		const pathTileNodes = cells.map((cell) => grid.cellToGrid(cell));
		return new BattlePath(pathTileNodes, alliedCastle, enemyCastle);
	}

	static toEnemy(grid: BattleGrid, cells: Cell[], alliedCastle: AnyBattleCastle, enemyCastle: AnyBattleCastle) {
		const pathTileNodes = cells.map((cell) => {
			const flipped = BattleGrid.flip(grid, cell);
			const position = grid.cellToGrid(flipped);
			return position;
		});
		return new BattlePath(pathTileNodes, alliedCastle, enemyCastle);
	}
}
