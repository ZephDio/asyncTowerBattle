// import { BattleCastle } from "../../castle/battle/battle-castle";
// import { BattleGrid } from "../../grid/battle-grid";
// import { ArmyGrid } from "../../grid/grid";
// import { BattlePath } from "../battle/battle-path";
// import { BattleArmyHooks } from "../../army/battle/battle-army";
// import { AnyPathTile } from "../../tile/recruit/tile";
// import { Cell } from "../../../shared/position";

// export class ArmyPath {
// 	constructor(public tiles: AnyPathTile[]) {}

// 	static chainTiles(from: Cell, to: Cell, tiles: AnyPathTile[]) {
// 		const remaining = new Set(tiles);

// 		const firstTile = tiles.find((tile) => tile.cell.equals(from));
// 		if (!firstTile) throw new Error("Invalid Path: No initial tile found");

// 		remaining.delete(firstTile);

// 		const path: AnyPathTile[] = [firstTile];

// 		while (!path.at(-1)!.cell.equals(to)) {
// 			if (!remaining.size) {
// 				break;
// 			}

// 			const current = path.at(-1)!;

// 			let found = false;
// 			for (const candidate of remaining) {
// 				if (candidate.cell.isAdjascentTo(current.cell)) {
// 					path.push(candidate);
// 					remaining.delete(candidate);
// 					found = true;
// 					break;
// 				}
// 			}
// 			if (!found) {
// 				throw new Error("No path found");
// 			}
// 		}

// 		if (!path.at(-1)?.cell?.equals(to)) throw new Error("No path found");

// 		return path;
// 	}

// 	toAllied(
// 		_battleGrid: BattleGrid,
// 		grid: ArmyGrid,
// 		alliedCastle: BattleCastle,
// 		enemyCastle: BattleCastle,
// 		hooks: BattleArmyHooks,
// 	) {
// 		const continuousTiles = ArmyPath.chainTiles(grid.getEnemyDoorCell(), alliedCastle.cell.down(), this.tiles);
// 		const continuousBattleTiles = continuousTiles.map((tile) =>
// 			tile.toBattle(tile.cell, grid.cellToReal(tile.cell), hooks),
// 		);
// 		return new BattlePath(continuousBattleTiles, alliedCastle, enemyCastle);
// 	}

// 	toEnemy(
// 		battleGrid: BattleGrid,
// 		grid: ArmyGrid,
// 		alliedCastle: BattleCastle,
// 		enemyCastle: BattleCastle,
// 		hooks: BattleArmyHooks,
// 	) {
// 		return new BattlePath(
// 			this.tiles.map((tile) => {
// 				const flippedGridPosition = BattleGrid.flip(battleGrid, tile.cell);
// 				return tile.toBattle(flippedGridPosition, grid.cellToReal(flippedGridPosition), hooks);
// 			}),
// 			alliedCastle,
// 			enemyCastle,
// 		);
// 	}

// 	checkInitialTile(gridHeight: number) {
// 		return this.tiles.find((tile) => tile.cell.x === 0 && tile.cell.y === gridHeight - 1);
// 	}
// }
