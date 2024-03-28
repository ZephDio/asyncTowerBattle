import { GridPosition, Position } from "../../shared/position";
import { BattleArmy } from "../army/battle/battle-army";
import { BattleCastle } from "../castle/battle/battle-castle";
import { PathTile } from "../path/entity/path";
import { BattleTower } from "../tower/battle/battle-tower";
import { Grid, GridElement, SerializedGrid } from "./grid";

export type BattleGridElement = BattleTower | PathTile | BattleCastle;
export class BattleGrid {
	grid: Map<string, BattleGridElement> = new Map();
	constructor(
		public gridAllied: Grid,
		public gridEnemy: Grid,
		public width: number,
		public height: number,
		public position: Position = { x: 2, y: 1.5 },
		public tileSize = 4.9,
	) {}

	gridPositionToReal(gridPosition: GridPosition) {
		return {
			x: this.position.x + (gridPosition.gridX + 0.5) * this.tileSize,
			y: this.position.y + (gridPosition.gridY + 0.5) * this.tileSize,
		};
	}

	static fuse(gridAllied: Grid, gridEnemy: Grid): BattleGrid {
		if (gridAllied.width !== gridEnemy.width || gridAllied.height !== gridEnemy.height) {
			throw new Error("cannot fuse grid with different grid size");
		}
		const battleGrid = new BattleGrid(
			gridAllied,
			gridEnemy,
			gridAllied.width,
			gridAllied.height + gridEnemy.height,
			gridAllied.position,
			gridAllied.tileSize,
		);
		return battleGrid;
	}

	initElements(alliedArmy: BattleArmy, enemyArmy: BattleArmy) {
		const gridElements = [
			...alliedArmy.towers,
			alliedArmy.castle,
			...alliedArmy.path.tiles,
			...enemyArmy.towers,
			enemyArmy.castle,
			...enemyArmy.path.tiles,
		];
		for (const gridElement of gridElements) {
			this.setElement(gridElement);
		}
	}

	setElement(gridElement: GridElement) {
		this.grid.set(Grid.posToString(gridElement.gridPosition), gridElement);
	}

	toSerialized() {
		const serialized: SerializedGrid = {
			width: this.width,
			height: this.height,
			position: this.position,
			tileSize: this.tileSize,
		};
		return serialized;
	}

	getRelativeNeighbor(gridPosition: GridPosition, relativePosition: GridPosition) {
		const targetPosition = {
			gridX: gridPosition.gridX + relativePosition.gridX,
			gridY: gridPosition.gridY + relativePosition.gridY,
		};
		const elementFound = this.grid.get(Grid.posToString(targetPosition));
		return elementFound;
	}

	getHooks() {
		return {
			getRelativeNeighbor: this.getRelativeNeighbor.bind(this),
		};
	}

	static flip(battleGrid: BattleGrid, gridPosition: GridPosition) {
		const halfWidth = (battleGrid.width - 1) / 2;
		const halfHeight = (battleGrid.height - 1) / 2;
		return {
			gridX: halfWidth - gridPosition.gridX + halfWidth,
			gridY: halfHeight - gridPosition.gridY + halfHeight,
		};
	}
}

export type GridHooks = {
	getRelativeNeighbor: BattleGrid["getRelativeNeighbor"];
};
