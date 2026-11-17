import { Trait } from "@ddd-ts/traits";

export const TShopBlueprint = (price: number, share: number) =>
	Trait((base) => {
		abstract class IShopeBluePrint extends base {
			price = price;
			probabilityShare = share;
		}
		return IShopeBluePrint;
	});
