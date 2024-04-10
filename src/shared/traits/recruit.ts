import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox, TGCollider } from "../hitboxes";
import { HTImageDrawable } from "./drawable";
import { TokenHooks } from "../../engine/shop/holder/holder";
import { GridPosition } from "../position";
import { TGrid } from "../../engine/grid/tgrid";

export const TRecruit = Subtrait([TGCollider, HTHitbox, HTImageDrawable], (base) => {
	abstract class IRecruit extends base {
		abstract moveRecruit(hooks: TokenHooks, gridPosition: GridPosition, grid?: ImplementsTrait<typeof TGrid>): void;
	}
	return IRecruit;
});

export type AnyRecruit = ImplementsTrait<typeof TRecruit>;
