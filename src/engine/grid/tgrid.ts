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
		abstract tiles: Map<string, ImplementsTrait<typeof GridElement>>;
		abstract overEffect: HoverEffect | undefined;
		abstract synergiesEffects: SynergyEffect[];
		public abstract width: number;
		public abstract height: number;
		public abstract position: ScreenPosition;
		public abstract cellSize: number;
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
	}
	return IGrid;
});
