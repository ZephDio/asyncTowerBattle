import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { HudElementResources } from "../../../renderer/resources/hud-element.resources";

export class NextRoundHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 18, height: 11 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	constructor(
		public runOver = false,
		public position: ScreenPosition = PercentToReal({ x: 50, y: 25 }),
	) {
		super({});
	}
	size = { width: 25, height: 11 };
	drawPriority = DrawPriority.HUD;
	background = HudElementResources.startGame.image;

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, canvasSize, canvasPosition, this.background);

		context.fillStyle = "#172634";
		context.font = `${canvasSize.height * 0.22}px title`;
		context.textAlign = "center";
		context.fillText(this.runOver ? "Continue" : "Next Round", canvasPosition.x, canvasPosition.y);
	}
}
