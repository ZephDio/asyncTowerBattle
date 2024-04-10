import { GridPosition, ScreenPosition } from "../../../../shared/position";
import { HTImageDrawable, THudRenderable } from "../../../../shared/traits/drawable";
import { ImplementsTrait, Subtrait } from "../../../../../traits/traits";
import { Synergy } from "../../../../shared/traits/synergy";
import { AnyRecruit } from "../../../../shared/traits/recruit";
import { Buyable } from "../../retail/buyable";
import { TokenHooks } from "../holder";
import { TGrid } from "../../../grid/tgrid";

type Holdable = Buyable | AnyRecruit;

export const TTokenDrag = Subtrait([THudRenderable, HTImageDrawable], (base, Props) => {
	abstract class ITokenDrag extends base {
		protected hooks: TokenHooks;
		public position: ScreenPosition;
		constructor(props: { hooks: TokenHooks; position: ScreenPosition } & typeof Props) {
			super(props);
			this.hooks = props.hooks;
			this.position = props.position;
		}
		abstract holded: Holdable;
		abstract onRelease(position?: GridPosition, grid?: ImplementsTrait<typeof TGrid>): void;
		abstract getSynergies(): Synergy | undefined;
	}
	return ITokenDrag;
});
