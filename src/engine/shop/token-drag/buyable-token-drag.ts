import { Derive, implementsTrait } from "@ddd-ts/traits";
import { TTokenDrag } from "./token-drag";
import { Buyable, TokenHooks } from "../shop";
import { Position } from "../../../shared/position";
import { TSynergy } from "../../../shared/traits/synergy";

export class BuyableTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public entity: Buyable,
		position: Position,

		hooks: TokenHooks,
	) {
		super({ imageDrawable: entity, hooks, position });
	}
	onRelease(position?: Position): void {
		try {
			if (!position) throw new Error();
			this.entity.buy(this.entity, position);
		} catch {
			this.hooks.shopHooks.addItem(this.entity);
		}
		this.hooks.removeHold();
	}

	getSynergies() {
		if (implementsTrait(this.entity.entity, TSynergy)) {
			return this.entity.entity.getSynergies();
		}
		return undefined;
	}
}
