import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";

import { Cell } from "../../../position";
import { TGrid } from "../../../../engine/grid/tgrid";
import { TRenderable } from "../../render/renderable";

export const GridElement = Subtrait([TRenderable], (base) => {
	abstract class IGridElement extends base {
		abstract cell: Cell;

		getRealPosition(grid: ImplementsTrait<typeof TGrid>) {
			return grid.cellToGrid(this.cell);
		}
	}
	return IGridElement;
});
