import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox, TGCollider } from "../hitboxes";
import { GridElement } from "../../engine/grid/grid";
import { HTImageDrawable } from "./drawable";
import { TokenHooks } from "../../engine/shop/shop";
import { Position } from "../position";

export const TRecruit = Subtrait([TGCollider, HTHitbox, GridElement, HTImageDrawable], (base) => {
	abstract class IRecruit extends base {
		abstract moveRecruit(hooks: TokenHooks, position: Position): void;
	}
	return IRecruit;
});

export type AnyRecruit = ImplementsTrait<typeof TRecruit>;
