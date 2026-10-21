import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { TRenderable } from "../render/renderable";

// A grid element that can carry a trap on its cell. The trap is not in the grid's tiles: the grid draws it over its
// holder (see TGrid.getDrawables).
export const TTrapHolder = Trait((base) => {
	abstract class ITrapHolder extends base {
		abstract trap: ImplementsTrait<typeof TRenderable> | null;
	}
	return ITrapHolder;
});
