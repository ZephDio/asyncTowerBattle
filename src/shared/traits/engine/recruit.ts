import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TGCollider } from "./core/TGCollider";
import { HTImageDrawable } from "../render/image-drawable";
import { TokenHooks } from "../../../engine/shop/holder/holder";
import { GridPosition } from "../../position";
import { TGrid } from "../../../engine/grid/tgrid";
import { HTHitbox } from "./core/THitbox";
import { HTDescriptor } from "../render/huds/item-descriptor";
import { GridShape } from "./core/grid-element";

export const TRecruit = Subtrait([TGCollider, HTHitbox, HTDescriptor, HTImageDrawable], (base) => {
	abstract class IRecruit extends base {
		override gridShape = new GridShape();
		abstract moveRecruit(
			hooks: TokenHooks,
			gridPosition: GridPosition,
			orientation: number,
			grid?: ImplementsTrait<typeof TGrid>,
		): void;
	}
	return IRecruit;
});

export type AnyRecruit = ImplementsTrait<typeof TRecruit>;
