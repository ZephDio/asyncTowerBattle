import { MemorizePath } from "../../../shared/decorators/path-memorize";
import { Cell, Position } from "../../../shared/position";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { BattleGrid } from "../../grid/battle-grid";
import { AnyPathTile } from "../../tile/recruit/tile";
export class BattlePath {
	constructor(
		public pathTileNodes: Position[],
		public alliedCastle: BattleCastle,
		public enemyCastle: BattleCastle,
	) {}

	getNodes() {
		return [this.enemyCastle.position, ...this.pathTileNodes, this.alliedCastle.position];
	}

	static toAllied(grid: BattleGrid, cells: Cell[], alliedCastle: BattleCastle, enemyCastle: BattleCastle) {
		const pathTileNodes = cells.map((cell) => grid.cellToReal(cell));
		return new BattlePath(pathTileNodes, alliedCastle, enemyCastle);
	}

	static toEnemy(grid: BattleGrid, cells: Cell[], alliedCastle: BattleCastle, enemyCastle: BattleCastle) {
		const pathTileNodes = cells.map((cell) => {
			const flipped = BattleGrid.flip(grid, cell);
			const position = grid.cellToReal(flipped);
			return position;
		});
		return new BattlePath(pathTileNodes, alliedCastle, enemyCastle);
	}

	@MemorizePath()
	static chainTiles(from: Cell, to: Cell, tiles: AnyPathTile[]) {
		console.log("chainTiles");
		const remaining = new Set(tiles);

		const firstTile = tiles.find((tile) => tile.cell.equals(from));
		if (!firstTile) throw new Error("Invalid Path: No initial tile found");

		remaining.delete(firstTile);

		const path: AnyPathTile[] = [firstTile];

		while (!path.at(-1)!.cell.equals(to)) {
			if (!remaining.size) {
				break;
			}

			const current = path.at(-1)!;

			let found = false;
			for (const candidate of remaining) {
				if (candidate.cell.isAdjascentTo(current.cell)) {
					path.push(candidate);
					remaining.delete(candidate);
					found = true;
					break;
				}
			}
			if (!found) {
				throw new Error("No path found");
			}
		}

		if (!path.at(-1)?.cell?.equals(to)) throw new Error("No path found");

		return path.map((tile) => tile.cell);
	}
}
