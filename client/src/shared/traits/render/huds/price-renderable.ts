import { Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../position";
import { PriceHud } from "../../../hud-element/entity-hud/price-hud";
import { THasPrice } from "../../engine/has-price";
import { THudRenderable } from "./hud-renderable";

export const TPriceHudRenderable = Subtrait([THudRenderable, THasPrice], (base) => {
	abstract class IPriceHudRenderable extends base {
		unitPreview = new PriceHud(this);
		override huds() {
			return [
				...super.huds(),
				{
					hud: this.unitPreview,
					position: new GridPosition({ x: 0, y: -4.2 }),
				},
			];
		}
	}
	return IPriceHudRenderable;
});
