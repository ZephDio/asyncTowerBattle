import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition, ScreenPosition } from "../../../position";
import { STANDARD_CELL_SIZE, TGrid } from "../../../../engine/grid/tgrid";
import { TDrawable } from "../drawable";
import { TRenderable, drawHovered } from "../renderable";
import { TSizable } from "../../engine/core/sizable";

export const THudRenderable = Subtrait([TRenderable], (base) => {
	abstract class IHudRenderable extends base {
		huds(): {
			hud: ImplementsTrait<typeof TDrawable>;
			position: GridPosition;
		}[] {
			return [];
		}

		override render(context: CanvasRenderingContext2D, grid?: ImplementsTrait<typeof TGrid>): void {
			super.render(context, grid);
			for (const { hud, position } of this.huds()) {
				drawHovered(context, !!grid?.isHovered(hud), () => this.renderHud(context, hud, position, grid));
			}
		}

		private renderHud(
			context: CanvasRenderingContext2D,
			hud: ImplementsTrait<typeof TDrawable>,
			position: GridPosition,
			grid?: ImplementsTrait<typeof TGrid>,
		) {
			let elementScale = implementsTrait(this, TSizable) ? this.sizeScale : 1;
			if (this.position instanceof Cell) {
				if (!grid) {
					throw new Error("Grid is required to render cell position");
				}
				const scale = (grid.cellSize / STANDARD_CELL_SIZE) * elementScale;
				const gridPosition = grid.cellToGrid(this.position).add(position);
				const worldPosition = grid.gridToScreenPosition(gridPosition);
				hud.draw(context, worldPosition, scale);
			}
			if (this.position instanceof ScreenPosition) {
				const worldPosition = this.position.add(position);
				hud.draw(context, worldPosition, 1);
			}
			if (this.position instanceof GridPosition) {
				if (!grid) {
					throw new Error("Grid is required to render cell position");
				}
				const scale = (grid.cellSize / STANDARD_CELL_SIZE) * elementScale;
				const worldPosition = this.position.add(position);
				const screenPosition = grid.gridToScreenPosition(worldPosition);
				hud.draw(context, screenPosition, scale);
			}
		}
	}
	return IHudRenderable;
});
