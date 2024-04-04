import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Grid, GridElement } from "./grid";
import { Cell, Position } from "../../shared/position";
import { SynergyEffect } from "./grid-effects/synergy-effect";

export const TGrid = Trait((base) => {
	abstract class IGrid extends base {
		abstract tiles: Map<string, ImplementsTrait<typeof GridElement>>;
		abstract overEffect: Cell | undefined;
		abstract synergiesEffects: SynergyEffect[];
		public abstract width: number;
		public abstract height: number;
		public abstract position: Position;
		public abstract cellSize: number;
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
