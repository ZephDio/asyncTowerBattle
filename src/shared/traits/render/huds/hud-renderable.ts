import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { Cell, GridPosition, ScreenPosition } from "../../../position";
import { TGrid } from "../../../../engine/grid/tgrid";
import { TDrawable } from "../drawable";
import { TRenderable } from "../renderable";

// export const TRenderable = Subtrait([TDrawable], (base) => {
// 	abstract class IRenderable extends base {
// 		abstract get position(): ScreenPosition | GridPosition | Cell;
// 		render(context: CanvasRenderingContext2D, grid?: ImplementsTrait<typeof TGrid>) {
// 			//let elementScale = implementsTrait(this, TSizable) ? this.sizeScale : 1;
// 			if (this.position instanceof Cell) {
// 				if (!grid) {
// 					throw new Error("Grid is required to render");
// 				}
// 				const gridPosition = grid.cellToGrid(this.position);
// 				const screenPosition = grid.gridToScreenPosition(gridPosition);
// 				const scale = (grid.cellSize / 4.9) * 1;
// 				return this.draw(context, screenPosition, scale);
// 			}
// 			if (this.position instanceof GridPosition) {
// 				if (!grid) {
// 					throw new Error("Grid is required to render");
// 				}
// 				const scale = grid.cellSize / 4.9;
// 				const screenPosition = grid.gridToScreenPosition(this.position);
// 				return this.draw(context, screenPosition, scale);
// 			}
// 			if (this.position instanceof ScreenPosition) {
// 				return this.draw(context, this.position, 4.9);
// 			}
// 		}
// 	}
// 	return IRenderable;
// });

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
				if (this.position instanceof Cell) {
					if (!grid) {
						throw new Error("Grid is required to render cell position");
					}
					const gridPosition = grid.cellToGrid(this.position).add(position);
					const worldPosition = grid.gridToScreenPosition(gridPosition);
					hud.draw(context, worldPosition, grid.cellSize);
				}
				if (this.position instanceof ScreenPosition) {
					const worldPosition = this.position.add(position);
					hud.draw(context, worldPosition, 4.9);
				}
				if (this.position instanceof GridPosition) {
					if (!grid) {
						throw new Error("Grid is required to render cell position");
					}
					const worldPosition = this.position.add(position);
					const screenPosition = grid.gridToScreenPosition(worldPosition);
					hud.draw(context, screenPosition, grid.cellSize);
				}
			}
		}
	}
	return IHudRenderable;
});
