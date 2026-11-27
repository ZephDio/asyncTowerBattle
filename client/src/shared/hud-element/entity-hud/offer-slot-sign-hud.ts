import { Derive } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../position";
import { TDrawable } from "../../traits/render/drawable";
import { DrawPriority } from "../../traits/render/image-drawable";
import { TRenderable } from "../../traits/render/renderable";
import { PRICE_SIGN_DROP } from "../../traits/render/huds/price-renderable";
import { PriceHud, SoldSignHud } from "./price-hud";

// A sign that stays in an offer's slot while the offer is not on the grid: its price sign while the player holds the
// offer (the lock sign is ReservedSignHud's), or SOLD once it is bought. Placed by the grid like the offer.
export class OfferSlotSignHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	private sign: PriceHud | SoldSignHud;

	constructor(
		private cell: Cell,
		offer?: { price: number },
		soldPrice = 0,
	) {
		super({});
		this.sign = offer ? new PriceHud(offer) : new SoldSignHud(soldPrice);
	}

	get position() {
		return this.cell;
	}

	draw(context: CanvasRenderingContext2D, anchor: ScreenPosition, scale: number): void {
		this.sign.draw(context, new ScreenPosition({ x: anchor.x, y: anchor.y + PRICE_SIGN_DROP * scale }), scale);
	}
}
