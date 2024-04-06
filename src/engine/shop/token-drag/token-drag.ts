import { Position } from "../../../shared/position";
import { AnyTowerRecruit } from "../../tower/recruit/tower-recruit";
import { Buyable, TokenHooks } from "../shop";
import { HTImageDrawable, TRenderable } from "../../../shared/traits/drawable";
import { AnyPathTile } from "../../tile/entity/tile";
import { AnyBarrackRecruit } from "../../barrack/recruit/barrack-recruit";
import { AnyBarrack } from "../../barrack/entity/barrack";
import { PtiWrapRanch } from "../../grid/inventory/unit-inventory";
import { Subtrait } from "../../../../traits/traits";
import { Synergy } from "../../../shared/traits/synergy";

type Holdable = Buyable | AnyTowerRecruit | AnyPathTile | AnyBarrackRecruit | AnyBarrack | PtiWrapRanch;

export const TTokenDrag = Subtrait([TRenderable, HTImageDrawable], (base, Props) => {
	abstract class ITokenDrag extends base {
		protected hooks: TokenHooks;
		public position: Position;
		constructor(props: { hooks: TokenHooks; position: Position } & typeof Props) {
			super(props);
			this.hooks = props.hooks;
			this.position = props.position;
		}
		abstract entity: Holdable;
		abstract onRelease(position?: Position): void;

		abstract getSynergies(): Synergy | undefined;
	}
	return ITokenDrag;
});
