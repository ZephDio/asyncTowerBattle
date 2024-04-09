import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox, TGCollider } from "../hitboxes";
import { HTImageDrawable } from "./drawable";
import { Position } from "../position";
import { TokenHooks } from "../../engine/shop/holder/holder";

export const TRecruit = Subtrait([TGCollider, HTHitbox, HTImageDrawable], (base) => {
	abstract class IRecruit extends base {
		abstract moveRecruit(hooks: TokenHooks, position: Position): void;
	}
	return IRecruit;
});

export type AnyRecruit = ImplementsTrait<typeof TRecruit>;
