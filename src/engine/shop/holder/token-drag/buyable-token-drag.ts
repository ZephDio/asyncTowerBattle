import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TTokenDrag } from "./token-drag";
import { GridPosition, ScreenPosition } from "../../../../shared/position";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { RetailGrid } from "../../../grid/retail-grid";
import { Buyable } from "../../retail/buyable";
import { TokenHooks } from "../holder";
import { TGrid } from "../../../grid/tgrid";

export class BuyableTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public holded: Buyable,

		position: ScreenPosition,

		hooks: TokenHooks,
		public onAbort: () => void,
	) {
		super({ imageDrawable: holded, hooks, position, orientation: holded.orientation });
	}
	onRelease(position?: GridPosition, grid?: ImplementsTrait<typeof TGrid>): void {
		try {
			if (!position) throw new Error("Invalid position");
			if (!this.hooks.shopPhaseHooks.economyHooks.canPurchase(this.holded.price)) {
				throw new Error("Not enough gold");
			}
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				throw new Error("can't sell item in shop DHU");
			}
			this.holded.entity.moveRecruit(this.hooks, position, this.orientation, grid);
			this.hooks.shopPhaseHooks.shopHooks.buy(this.holded);
			this.hooks.holderHooks.removeHold();
		} catch {
			this.onAbort();
		}
	}

	getPatternEffect() {
		if (implementsTrait(this.holded.entity, TSynergy)) {
			return this.holded.entity.patternEffect;
		}
		return undefined;
	}
}
