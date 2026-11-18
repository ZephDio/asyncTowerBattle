import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TTokenDrag } from "./token-drag";
import { GridPosition, ScreenPosition } from "../../../../shared/position";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { RetailGrid } from "../../../grid/retail-grid";
import { Buyable } from "../../retail/buyable";
import { TokenHooks } from "../holder";
import { TGrid } from "../../../grid/tgrid";
import { TRecruit } from "../../../../shared/traits/engine/recruit";
import { RecruitTokenDrag } from "./army-recruit-token-drag";

export class BuyableTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public holded: Buyable,

		position: ScreenPosition,

		hooks: TokenHooks,
		public onAbort: () => void,
	) {
		super({ imageDrawable: holded, hooks, position });
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
			const element = this.holded.entity.moveRecruit(this.hooks, position, grid);
			if (!element) {
				this.hooks.shopPhaseHooks.shopHooks.buy(this.holded);
				this.hooks.holderHooks.removeHold();
				return;
			}
			if (implementsTrait(element, TRecruit)) {
				const onAbort = () => {
					// With a full inventory, the swapped-out recruit stays in hand until it is placed.
					if (!this.hooks.shopPhaseHooks.armyHooks.hasInventoryRoomFor(element)) return;
					this.hooks.shopPhaseHooks.armyHooks.pushToInventory(element);
					this.hooks.holderHooks.removeHold();
				};
				const token = new RecruitTokenDrag(element, this.position, this.hooks, onAbort);
				this.hooks.shopPhaseHooks.shopHooks.buy(this.holded);
				this.hooks.holderHooks.removeHold();
				this.hooks.holderHooks.setHold(token);
				this.hooks.shopPhaseHooks.armyHooks.removeRecruit(element);
				return;
			}
			throw new Error("Invalid element");
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
