import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../traits/render/drawable";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { TCollider } from "../traits/engine/core/TCollider";
import { ScreenPosition } from "../position";
import { TRenderable } from "../traits/render/renderable";
import { THitbox } from "../traits/engine/core/THitbox";
import { IconResources } from "../../renderer/resources/icons.resources";

const TEXT = "#ffe45c";
const TEXT_OUTLINE = "#2c1612";
// The purse body, where the amount is written, as fractions of the image (see scripts/generate-purse.py)
const BODY_CENTER_Y = 0.63;
const BODY_TEXT_WIDTH = 0.7;
// The amount's height for a short amount, as a fraction of the image; wider amounts shrink to fit the body
const TEXT_HEIGHT = 0.28;

// The player's gold, written with a coin on a purse in the bottom left corner of the shop.
export class GoldHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 7.5, height: 7.5 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	constructor(public gold: number) {
		super({});
	}
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.save();
		context.globalAlpha = 1;
		const center = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		this.drawImage(context, size, center, IconResources.purse.image);

		// The amount and its coin shrink together until they fit the body's width
		const text = this.gold.toString();
		let fontSize = size.height * TEXT_HEIGHT;
		context.font = `${fontSize}px text`;
		const width = context.measureText(text).width + fontSize * 1.05;
		fontSize *= Math.min(1, (size.width * BODY_TEXT_WIDTH) / width);
		context.font = `${fontSize}px text`;
		const textWidth = context.measureText(text).width;
		const coinSize = fontSize * 0.95;
		const gap = fontSize * 0.1;
		const left = center.x - (textWidth + gap + coinSize) / 2;
		const y = center.y + (BODY_CENTER_Y - 0.5) * size.height;

		context.textAlign = "left";
		context.textBaseline = "middle";
		context.lineJoin = "round";
		context.lineWidth = fontSize * 0.2;
		context.strokeStyle = TEXT_OUTLINE;
		// The "middle" baseline sits a bit above the digits' visual center, so nudge them down
		const textY = y + fontSize * 0.1;
		context.strokeText(text, left, textY);
		context.fillStyle = TEXT;
		context.fillText(text, left, textY);
		const coin = { width: coinSize, height: coinSize };
		this.drawImage(context, coin, { x: left + textWidth + gap + coinSize / 2, y }, IconResources.gold.image);
		context.restore();
	}
	public type = "goldDisplay";
	// Bottom left corner
	public position = new ScreenPosition({ x: 6.7, y: 4.5 });
	public size = { width: 7.5, height: 7.5 };
}
