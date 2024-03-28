import { GridPosition, Position } from "../../shared/position";
import { Castle } from "../castle/entity/castle";
import { CastleRecruit } from "../castle/recruit/castle-recruit";
import { PathTile } from "../path/entity/path";
import { TowerRecruit } from "../tower/recruit/tower-recruit";

export type GridElement = TowerRecruit | PathTile | CastleRecruit<Castle>;

export type SerializedGrid = {
	width: number;
	height: number;
	position: Position;
	tileSize: number;
};

export class Grid {
	grid: Map<string, GridElement> = new Map();

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
		const x = Math.round((position.x - this.position.x) / this.tileSize - 0.5);
		const y = Math.round((position.y - this.position.y) / this.tileSize - 0.5);
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return undefined;
		}
		return {
			gridX: x,
			gridY: y,
		};
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

	static posToString(gridPosition: GridPosition) {
		return `${gridPosition.gridX}|${gridPosition.gridY}`;
	}
}
