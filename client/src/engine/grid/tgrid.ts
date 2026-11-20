import { ImplementsTrait, Trait, implementsTrait } from "@ddd-ts/traits";
import { ArmyGrid } from "./grid";
import { Cell, GridPosition, ScreenPosition } from "../../shared/position";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../shared/traits/render/renderable";
import { TRecruit } from "../../shared/traits/engine/recruit";
import { Castle } from "../castle/recruit/castle-recruit";
import { TTrapHolder } from "../../shared/traits/engine/trap-holder";

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

		get position(): ScreenPosition {
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

		validateGridElementPlacement(
			gridElement: ImplementsTrait<typeof GridElement>,
			cell: Cell,
		): { valid: boolean; elements: ImplementsTrait<typeof TRecruit>[] } {
			const cells = gridElement.gridShape.getOccupiedCellsFrom(cell);
			for (const cell of cells) {
				if (cell.x < 0 || cell.x >= this.width || cell.y < 0 || cell.y >= this.height) {
					return { valid: false, elements: [] };
				}
			}
			const founds = new Set<ImplementsTrait<typeof TRecruit>>();
			for (const cell of cells) {
				const found = this.getElement(cell);
				if (found) {
					if (implementsTrait(found, Castle)) return { valid: false, elements: [] };
					if (!implementsTrait(found, TRecruit)) return { valid: false, elements: [] };
					founds.add(found);
				}
			}
			return { valid: true, elements: [...founds.values()] };
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
				// An element spanning several pattern cells counts once.
				if (elementFound && !founds.includes(elementFound)) {
					founds.push(elementFound);
				}
			}
			return founds;
		}

		getElements() {
			return [...this.tiles.values()];
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
		// Drawn over the elements of some cells, under the traps. See ArmyGrid's locked cell.
		getCellOverlays(): ImplementsTrait<typeof TRenderable>[] {
			return [];
		}

		getDrawables(): ImplementsTrait<typeof TRenderable>[] {
			const elements = [...this.tiles.values()];
			// Traps come after the elements so they are drawn over the path tile carrying them.
			const traps = elements.flatMap((element) =>
				implementsTrait(element, TTrapHolder) && element.trap ? [element.trap] : [],
			);
			return [
				...elements,
				...this.getCellOverlays(),
				...traps,
				...this.synergiesEffects,
				...(this.hoverEffect ? [...this.hoverEffect] : []),
			];
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
