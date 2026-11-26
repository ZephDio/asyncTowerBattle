import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../../traits/render/drawable";
import { THasPrice } from "../../traits/engine/has-price";
import { ScreenPosition } from "../../position";
import { IconResources } from "../../../renderer/resources/icons.resources";
import { HudElementResources } from "../../../renderer/resources/hud-element.resources";

// The board of scripts/generate-price-sign.py, in art pixels: its height, and the rows of its face.
const BOARD = 13;
const FACE_TOP = 2;
const FACE_BOTTOM = 11;
// Room left and right of the price, and between the price and the coin.
const PADDING = 1;
const GAP = 1;
const COIN = 8;
// Screen units per art pixel: two thirds of the army banner's, so the sign stays smaller than the pieces.
const ART_PIXEL = 0.14;

// Where the price sign of `price` stands, centered on `center` (canvas pixels): its top left corner, its width, the
// canvas pixels per art pixel and the width of its text in art pixels. The context's font is left set for the text.
export function priceSignLayout(
	context: CanvasRenderingContext2D,
	center: { x: number; y: number },
	price: number,
	unit: number,
) {
	const { left, right } = HudElementResources.priceSign;
	const p = Math.max(1, Math.round(unit * ART_PIXEL));
	context.font = `${(FACE_BOTTOM - FACE_TOP + 1) * p}px title`;
	const textWidth = Math.ceil(context.measureText(price.toString()).width / p);
	const inner = PADDING + textWidth + GAP + COIN + PADDING;
	const width = (left.width + inner + right.width) * p;
	return { x: Math.round(center.x - width / 2), y: Math.round(center.y - (BOARD * p) / 2), width, inner, textWidth, p };
}

// The price of an offer on a little wooden sign planted below it, with the gold coin, in the wood of the shop and
// reserve signs.
export class PriceHud extends Derive(TDrawable) {
	override drawPriority: 4;
	constructor(private buyable: ImplementsTrait<typeof THasPrice>) {
		super({});
	}
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, _scale: number) {
		const { left, middle, right } = HudElementResources.priceSign;
		const coin = IconResources.gold.image;
		if (![left, middle, right, coin].every((image) => image.complete && image.naturalWidth > 0)) return;
		const center = this.getCanvasPosition(context, position);
		const text = this.buyable.price.toString();

		context.save();
		context.globalAlpha = 1;
		context.imageSmoothingEnabled = false;
		const unit = this.getCanvasSize(context, 1, 1).width;
		const { x, y, inner, textWidth, p } = priceSignLayout(context, center, this.buyable.price, unit);
		context.textAlign = "left";
		context.textBaseline = "middle";
		context.drawImage(left, x, y, left.width * p, left.height * p);
		context.drawImage(middle, x + left.width * p, y, inner * p, middle.height * p);
		context.drawImage(right, x + (left.width + inner) * p, y, right.width * p, right.height * p);

		const faceMiddle = y + ((FACE_TOP + FACE_BOTTOM) / 2) * p;
		const textX = x + (left.width + PADDING) * p;
		context.fillStyle = "#ffe5ad";
		context.fillText(text, textX, faceMiddle);
		const coinX = textX + (textWidth + GAP) * p;
		context.drawImage(coin, coinX, faceMiddle - (COIN * p) / 2, COIN * p, COIN * p);
		context.restore();
	}
}
