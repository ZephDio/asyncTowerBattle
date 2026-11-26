import { Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../position";
import { STANDARD_CELL_SIZE } from "../../../../engine/grid/grid-scale";
import { PriceHud } from "../../../hud-element/entity-hud/price-hud";
import { THasPrice } from "../../engine/has-price";
import { THudRenderable } from "./hud-renderable";

// How far below its offer's anchor the price sign stands, in grid units: 0.8 of a cell, in front of its building site,
// so it leaves the offer in full view.
export const PRICE_SIGN_DROP = -0.8 * STANDARD_CELL_SIZE;

export const TPriceHudRenderable = Subtrait([THudRenderable, THasPrice], (base) => {
	abstract class IPriceHudRenderable extends base {
		unitPreview = new PriceHud(this);
		override huds() {
			return [
				...super.huds(),
				{
					hud: this.unitPreview,
					position: new GridPosition({ x: 0, y: PRICE_SIGN_DROP }),
				},
			];
		}
	}
	return IPriceHudRenderable;
});
