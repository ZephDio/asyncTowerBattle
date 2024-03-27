import { GridPosition, Position } from "../../../shared/position";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { Castle } from "../../castle/entity/castle";
import { CastleRecruit } from "../../castle/recruit/castle-recruit";
import { BattleGrid } from "../../grid/battle-grid";
import { Grid } from "../../grid/grid";

export type PathNode = Position;

export class PathTile {
	constructor(
		public gridPosition: GridPosition,
		public type: string,
	) {}
}

export class ArmyPath {
	constructor(
		public tiles: PathTile[],
		alliedCastle: CastleRecruit<Castle>,
	) {}

	// getNodes() {
	//   return [...this.tiles, PercentToReal({ x: 10, y: 90 }) as Position];
	// }
	toAllied(battleGrid: BattleGrid, grid: Grid, alliedCastle: BattleCastle, enemyCastle: BattleCastle) {
		return new BattlePath(
			this.tiles.map(
				(tile) => new BattlePathTile(tile.gridPosition, grid.gridPositionToReal(tile.gridPosition), tile.type),
			),
			alliedCastle,
			enemyCastle,
		);
	}

	toEnemy(battleGrid: BattleGrid, grid: Grid, alliedCastle: BattleCastle, enemyCastle: BattleCastle) {
		return new BattlePath(
			this.tiles.map((tile) => {
				const flippedGridPosition = BattleGrid.flip(battleGrid, tile.gridPosition);
				return new BattlePathTile(flippedGridPosition, grid.gridPositionToReal(flippedGridPosition), tile.type);
			}),
			alliedCastle,
			enemyCastle,
		);
	}

	checkInitialTile(gridHeight: number) {
		return this.tiles.find((tile) => tile.gridPosition.gridX === 0 && tile.gridPosition.gridY === gridHeight - 1);
	}

	toSerialized(): SerializedPath {
		const serialized: SerializedPath = {
			tiles: this.tiles.map((tile) => {
				return { gridPosition: tile.gridPosition, type: tile.type };
			}),
		};
		return serialized;
	}
}

export class BattlePathTile {
	constructor(
		public gridPosition: GridPosition,
		public position: Position,
		public type: string,
	) {}
}
export class BattlePath {
	constructor(
		public tiles: BattlePathTile[],
		public alliedCastle: BattleCastle,
		public enemyCastle: BattleCastle,
	) {}

	getNodes() {
		return [this.enemyCastle.position, ...this.tiles.map((t) => t.position), this.alliedCastle.position];
	}

	toSerialized(): SerializedPath {
		const serialized: SerializedPath = {
			tiles: this.tiles.map((tile) => {
				return { gridPosition: { gridX: tile.gridPosition.gridX, gridY: tile.gridPosition.gridY }, type: tile.type };
			}),
		};
		return serialized;
	}
}

export interface SerializedPath {
	tiles: { gridPosition: { gridX: number; gridY: number }; type: string }[];
}
