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

const SIZE = { width: 14, height: 6 };

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
		this.drawImage(context, canvasSize, canvasPosition, HudElementResources.startGame.image);

		context.fillStyle = "#172634";
		context.font = `${canvasSize.height * 0.3}px title`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText("Continue", canvasPosition.x, canvasPosition.y);
	}
}
