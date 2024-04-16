import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TGCollider } from "./core/TGCollider";
import { HTImageDrawable } from "../render/image-drawable";
import { TokenHooks } from "../../../engine/shop/holder/holder";
import { GridPosition } from "../../position";
import { TGrid } from "../../../engine/grid/tgrid";
import { HTHitbox } from "./core/THitbox";
import { HTDescriptor } from "../render/huds/item-descriptor";

export const TRecruit = Subtrait([TGCollider, HTHitbox, HTDescriptor, HTImageDrawable], (base) => {
	abstract class IRecruit extends base {
		abstract moveRecruit(hooks: TokenHooks, gridPosition: GridPosition, grid?: ImplementsTrait<typeof TGrid>): void;
	}
	return IRecruit;
});

export type AnyRecruit = ImplementsTrait<typeof TRecruit>;
