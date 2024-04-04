import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Grid, GridElement } from "./grid";
import { Cell, Position } from "../../shared/position";
import { SynergyEffect } from "./grid-effects/synerny-effect";

export const TGrid = Trait((base) => {
	abstract class IGrid extends base {
		tiles: Map<string, ImplementsTrait<typeof GridElement>>;
		overEffect: Cell | undefined;
		synergiesEffects: SynergyEffect[];
		public width: number;
		public height: number;
		public position: Position;
		public cellSize: number;
		cellToReal(cell: Cell) {
			return new Position({
				x: this.position.x + (cell.x + 0.5) * this.cellSize,
				y: this.position.y + (cell.y + 0.5) * this.cellSize,
			});
		}

		realPositionToGrid(position: Position) {
			const x = Math.round((position.x - this.position.x) / this.cellSize - 0.5);
			const y = Math.round((position.y - this.position.y) / this.cellSize - 0.5);
			if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
				return undefined;
			}
			return new Cell({ x: x, y: y });
		}
		setElement(gridElement: ImplementsTrait<typeof GridElement>) {
			this.tiles.set(Grid.posToString(gridElement.cell), gridElement);
		}

		deleteElement(gridElement: ImplementsTrait<typeof GridElement>) {
			this.tiles.delete(Grid.posToString(gridElement.cell));
		}
	}
	return IGrid;
});
