import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { ArmyGrid } from "./grid";
import { Cell, GridPosition, ScreenPosition } from "../../shared/position";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../shared/traits/render/renderable";

export const STANDARD_CELL_SIZE = 4.9;

export const TGrid = Trait((base) => {
	abstract class IGrid extends base {
		public centerPosition: ScreenPosition;
		public bottomLeftCornerPosition: ScreenPosition;
		public width: number;
		public height: number;
		public cellSize: number;
		constructor(props: { position: ScreenPosition; width: number; height: number; cellSize: number }) {
			super(props);
			this.centerPosition = props.position;
			this.width = props.width;
			this.height = props.height;
			this.cellSize = props.cellSize;
			this.updateCornerPosition();
		}
		abstract tiles: Map<string, ImplementsTrait<typeof GridElement>>;
		abstract hoverEffect: HoverEffect[] | null;
		abstract synergiesEffects: SynergyEffectHud[];

		get position() {
			return this.bottomLeftCornerPosition;
		}

		cellToGrid(cell: Cell) {
			return new GridPosition({
				x: (cell.x + 0.5) * STANDARD_CELL_SIZE,
				y: (cell.y + 0.5) * STANDARD_CELL_SIZE,
			});
		}

		screenToGridPosition(position: ScreenPosition) {
			return new GridPosition({
				x: (position.x - this.position.x) / (this.cellSize / STANDARD_CELL_SIZE),
				y: (position.y - this.position.y) / (this.cellSize / STANDARD_CELL_SIZE),
			});
		}

		gridToScreenPosition(position: GridPosition) {
			return new ScreenPosition({
				x: this.position.x + position.x * (this.cellSize / STANDARD_CELL_SIZE),
				y: this.position.y + position.y * (this.cellSize / STANDARD_CELL_SIZE),
			});
		}

		gridPositionToCell(position: GridPosition) {
			const x = Math.floor(position.x / STANDARD_CELL_SIZE);
			const y = Math.floor(position.y / STANDARD_CELL_SIZE);
			if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
				return undefined;
			}
			return new Cell({ x: x, y: y });
		}

		checkCondition(gridElement: ImplementsTrait<typeof GridElement>, cell: Cell, orientation: number) {
			const cells = gridElement.gridShape.getOccupiedCellsFrom(cell, orientation);
			for (const cell of cells) {
				if (cell.x < 0 || cell.x >= this.width || cell.y < 0 || cell.y >= this.height) {
					return false;
				}
			}
			for (const cell of cells) {
				const found = this.getElement(cell);
				if (found) {
					return false;
				}
			}
			return true;
		}

		setElement(gridElement: ImplementsTrait<typeof GridElement>) {
			const cells = gridElement.gridShape.getOccupiedCellsFrom(gridElement.cell, gridElement.orientation);
			for (const cell of cells) {
				this.tiles.set(ArmyGrid.posToString(cell), gridElement);
			}
		}

		getRelativeNeighborsInGrid(gridPosition: Cell, relativePositions: Cell[]) {
			const founds: ImplementsTrait<typeof GridElement>[] = [];
			for (const relativePosition of relativePositions) {
				const targetPosition = new Cell({
					x: gridPosition.x + relativePosition.x,
					y: gridPosition.y + relativePosition.y,
				});
				const elementFound = this.tiles.get(ArmyGrid.posToString(targetPosition));
				if (elementFound) {
					founds.push(elementFound);
				}
			}
			return founds;
		}

		getElement(cell: Cell) {
			return this.tiles.get(ArmyGrid.posToString(cell));
		}

		deleteElement(gridElement: ImplementsTrait<typeof GridElement>) {
			const cells = gridElement.gridShape.getOccupiedCellsFrom(gridElement.cell, gridElement.orientation);
			for (const cell of cells) {
				const foundElement = this.tiles.get(ArmyGrid.posToString(cell));
				if (gridElement === foundElement) {
					this.tiles.delete(ArmyGrid.posToString(cell));
				}
			}
		}
		getDrawables(): ImplementsTrait<typeof TRenderable>[] {
			return [...this.tiles.values(), ...this.synergiesEffects, ...(this.hoverEffect ? [...this.hoverEffect] : [])];
		}

		translate() {
			const translated = new Map();
			const set = new Set([...this.tiles.values()]);
			[...set.values()].forEach((gridElement) => {
				gridElement.cell = gridElement.cell.up();
				for (const cell of gridElement.gridShape.getOccupiedCellsFrom(gridElement.cell, gridElement.orientation)) {
					translated.set(ArmyGrid.posToString(cell), gridElement);
				}
				this.tiles = translated;
			});
			this.updateCornerPosition();
		}

		updateCornerPosition() {
			this.bottomLeftCornerPosition = new ScreenPosition({
				x: this.centerPosition.x - (this.width * this.cellSize) / 2,
				y: this.centerPosition.y - (this.height * this.cellSize) / 2,
			});
		}
	}
	return IGrid;
});
