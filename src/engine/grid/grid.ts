import { proportion } from "../../renderer/implementation/canvas-renderer";
import { GridPosition, Position } from "../../shared/position";
import { BattleCastle } from "../castle/battle/battle-castle";
import { Castle } from "../castle/entity/castle";
import { CastleRecruit } from "../castle/recruit/castle-recruit";
import { PathTile } from "../path/entity/path";
import { BattleTower } from "../tower/battle/battle-tower";
import { Tower } from "../tower/entity/tower";
import { TowerRecruit } from "../tower/recruit/tower-recruit";

export type GridElement = TowerRecruit<Tower> | PathTile | CastleRecruit<Castle>;

export type SerializedGrid = {
	width: number;
	height: number;
	position: Position;
	tileSize: number;
};

export class Grid {
	grid: Map<GridPosition, GridElement> = new Map();

	constructor(
		public width: number = 13,
		public height: number = 6,
		public position: Position = { x: 2, y: 1.5 },
		public tileSize = 4.9,
	) {}

	gridPositionToReal(gridPosition: GridPosition) {
		return {
			x: this.position.x + (gridPosition.gridX + 0.5) * this.tileSize,
			y: this.position.y + (gridPosition.gridY + 0.5) * this.tileSize,
		};
	}

	realPositionToGrid(position: Position) {
		return {
			gridX: Math.round((position.x - this.position.x) / this.tileSize - 0.5),
			gridY: Math.round((position.y - this.position.y) / this.tileSize - 0.5),
		};
	}

	setElement(gridElement: GridElement, previousPosition?: GridPosition) {
		if (previousPosition) this.grid.delete(previousPosition);
		this.grid.set(gridElement.gridPosition, gridElement);
		console.log(this.grid);
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
}
