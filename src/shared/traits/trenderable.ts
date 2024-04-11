import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TDrawable } from "./tdrawable";
import { Cell, GridPosition, ScreenPosition } from "../position";
import { TGrid } from "../../engine/grid/tgrid";

export const TRenderable = Subtrait([TDrawable], (base) => {
	abstract class IRenderable extends base {
		abstract get position(): ScreenPosition | GridPosition | Cell;

		render(context: CanvasRenderingContext2D, grid?: ImplementsTrait<typeof TGrid>) {
			/* @ts-ignore */ // TODO: Fix TS error
			let elementScale = this.sizeScale ? this.sizeScale : 1;
			if (this.position instanceof Cell) {
				if (!grid) {
					throw new Error("Grid is required to render");
				}
				const gridPosition = grid.cellToGrid(this.position);
				const screenPosition = grid.gridToScreenPosition(gridPosition);
				const scale = (grid.cellSize / 4.9) * elementScale;
				return this.draw(context, screenPosition, scale);
			}
			if (this.position instanceof GridPosition) {
				if (!grid) {
					throw new Error("Grid is required to render");
				}
				const scale = (grid.cellSize / 4.9) * elementScale;
				const screenPosition = grid.gridToScreenPosition(this.position);
				return this.draw(context, screenPosition, scale);
			}
			if (this.position instanceof ScreenPosition) {
				return this.draw(context, this.position, 1);
			}
		}
	}
	return IRenderable;
});
