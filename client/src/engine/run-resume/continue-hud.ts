import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../shared/traits/render/drawable";
import { TRenderable } from "../../shared/traits/render/renderable";
import { DrawPriority } from "../../shared/traits/render/image-drawable";
import { ScreenPosition } from "../../shared/position";
import { THitbox } from "../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../shared/hitbox/hitboxe";
import { Rectangle } from "../../shared/hitbox/shapes/rectangle";
import { TCollider } from "../../shared/traits/engine/core/TCollider";
import { HudElementResources } from "../../renderer/resources/hud-element.resources";

// The image is 304x96, like the shop's start button at 224x96 drawn 12 wide.
const SIZE = { width: 13, height: 13 * (96 / 304) };

export class ContinueHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle(SIZE), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	constructor(public position: ScreenPosition) {
		super({});
	}
	size = SIZE;
	drawPriority = DrawPriority.HUD;

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, canvasSize, canvasPosition, HudElementResources.continueButton.image);
	}
}
