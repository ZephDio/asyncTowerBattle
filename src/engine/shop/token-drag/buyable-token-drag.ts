import { Derive, implementsTrait } from "@ddd-ts/traits";
import { TTokenDrag } from "./token-drag";
import { TokenHooks } from "../shop";
import { Position } from "../../../shared/position";
import { TSynergy } from "../../../shared/traits/synergy";
import { RetailGrid } from "../../grid/retail-grid";
import { Buyable } from "../buyable";

export class BuyableTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public holded: Buyable,
		position: Position,

		hooks: TokenHooks,
		public onAbort: () => void,
	) {
		super({ imageDrawable: holded, hooks, position });
	}
	onRelease(position?: Position): void {
		try {
			if (!position) throw new Error("Invalid position");
			if (!(this.hooks.economyHooks.getEconomy().gold >= this.holded.price)) {
				throw new Error("Not enough gold");
			}
			const grid = this.hooks.shopHooks.determinateGrid(position);

			if (grid instanceof RetailGrid) {
				throw new Error("can't sell item in shop DHU");
			}
			this.holded.entity.moveRecruit(this.hooks, position);
			this.hooks.shopHooks.buy(this.holded, position);
			this.hooks.removeHold();
		} catch {
			this.onAbort();
		}
	}

	getSynergies() {
		if (implementsTrait(this.holded.entity, TSynergy)) {
			return this.holded.entity.getSynergies();
		}
		return undefined;
	}
}
