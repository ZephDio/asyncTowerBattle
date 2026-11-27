import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "./drawable";
import { Cell, GridPosition, ScreenPosition } from "../../position";
import { STANDARD_CELL_SIZE, TGrid } from "../../../engine/grid/tgrid";
import { TSizable } from "../engine/core/sizable";

const HOVERED_FILTER = "brightness(1.35)";

export const TRenderable = Subtrait([TDrawable], (base) => {
	abstract class IRenderable extends base {
		abstract get position(): ScreenPosition | GridPosition | Cell;

		render(context: CanvasRenderingContext2D, grid?: ImplementsTrait<typeof TGrid>) {
			if (!grid?.isHovered(this)) return this.renderPlain(context, grid);
			context.save();
			context.filter = HOVERED_FILTER;
			this.renderPlain(context, grid);
			context.restore();
		}

		private renderPlain(context: CanvasRenderingContext2D, grid?: ImplementsTrait<typeof TGrid>) {
			let elementScale = implementsTrait(this, TSizable) ? this.sizeScale : 1;
			if (this.position instanceof Cell) {
				if (!grid) {
					throw new Error("Grid is required to render");
				}
				const gridPosition = grid.cellToGrid(this.position);
				const screenPosition = grid.gridToScreenPosition(gridPosition);
				const scale = (grid.cellSize / STANDARD_CELL_SIZE) * elementScale;
				return this.draw(context, screenPosition, scale);
			}
			if (this.position instanceof GridPosition) {
				if (!grid) {
					throw new Error("Grid is required to render");
				}
				const scale = (grid.cellSize / STANDARD_CELL_SIZE) * elementScale;
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
