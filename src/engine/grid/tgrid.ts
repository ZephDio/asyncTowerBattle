import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { ArmyGrid } from "./grid";
import { Cell, GridPosition, ScreenPosition } from "../../shared/position";
import { SynergyEffect } from "./grid-effects/synergy-effect";
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
		abstract overEffect: HoverEffect | undefined;
		abstract synergiesEffects: SynergyEffect[];

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

		setElement(gridElement: ImplementsTrait<typeof GridElement>) {
			this.tiles.set(ArmyGrid.posToString(gridElement.cell), gridElement);
		}

		getElement(cell: Cell) {
			return this.tiles.get(ArmyGrid.posToString(cell));
		}

		deleteElement(gridElement: ImplementsTrait<typeof GridElement>) {
			const foundElement = this.tiles.get(ArmyGrid.posToString(gridElement.cell));
			if (gridElement === foundElement) {
				this.tiles.delete(ArmyGrid.posToString(gridElement.cell));
			}
		}
		getDrawables(): ImplementsTrait<typeof TRenderable>[] {
			return [...this.tiles.values(), ...this.synergiesEffects, ...(this.overEffect ? [this.overEffect] : [])];
		}

		translate() {
			const translated = new Map();
			this.tiles.forEach((gridElement) => {
				gridElement.cell = gridElement.cell.up();
				translated.set(ArmyGrid.posToString(gridElement.cell), gridElement);
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
