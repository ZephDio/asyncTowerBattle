import { Cell, GridPosition } from "../../../shared/position";
import { AnyBattleCastle } from "../../castle/battle";
import { BattleGrid } from "../../grid/battle-grid";
export class BattlePath {
	constructor(
		public pathTileNodes: GridPosition[],
		public alliedCastle: AnyBattleCastle,
		public enemyCastle: AnyBattleCastle,
	) {}

	getNodes() {
		return [this.enemyCastle.position, ...this.pathTileNodes, this.alliedCastle.position];
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
