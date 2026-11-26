import { Derive } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../position";
import { TDrawable } from "../../traits/render/drawable";
import { DrawPriority } from "../../traits/render/image-drawable";
import { TRenderable } from "../../traits/render/renderable";
import { HudElementResources } from "../../../renderer/resources/hud-element.resources";
import { PRICE_SIGN_DROP } from "../../traits/render/huds/price-renderable";
import { priceSignLayout } from "./price-hud";

// Where the lock sign stands against the price sign, in art pixels: its left edge this far inside the price sign's
// right edge, past the coin, and its top this far below the price sign's top, so the price and the coin stay in view.
const OVERLAP_X = 3;
const DROP_Y = 7;

// The small padlock sign of a reserved offer (scripts/generate-price-sign.py), planted in front of the lower right
// corner of its price sign, in the same wood and at the same art pixel.
export class ReservedSignHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;

	constructor(private offer: { cell: Cell; price: number }) {
		super({});
	}

	// The offer's cell, placed by the grid like the offer; the price sign stands PRICE_SIGN_DROP below it.
	get position() {
		return this.offer.cell;
	}

	draw(context: CanvasRenderingContext2D, anchor: ScreenPosition, scale: number): void {
		const position = new ScreenPosition({ x: anchor.x, y: anchor.y + PRICE_SIGN_DROP * scale });
		const { lock, left, right } = HudElementResources.priceSign;
		if (![lock, left, right].every((image) => image.complete && image.naturalWidth > 0)) return;
		context.save();
		context.globalAlpha = 1;
		context.imageSmoothingEnabled = false;
		const center = this.getCanvasPosition(context, position);
		const sign = priceSignLayout(context, center, this.offer.price, this.getCanvasSize(context, 1, 1).width);
		const p = sign.p;
		context.drawImage(lock, sign.x + sign.width - OVERLAP_X * p, sign.y + DROP_Y * p, lock.width * p, lock.height * p);
		context.restore();
	}
}
