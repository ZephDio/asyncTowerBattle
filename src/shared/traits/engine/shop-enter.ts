import { Trait } from "@ddd-ts/traits";
import { ArmyHooks } from "../../../engine/army/army";

export const ShopEnterTrigger = Trait((base) => {
	abstract class ShopEnterTrigger extends base {
		abstract onShopEnter(hooks: ArmyHooks): void;
	}
	return ShopEnterTrigger;
});
