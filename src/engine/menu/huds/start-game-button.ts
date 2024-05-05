import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Resources } from "../../../renderer/resources";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";

export class StartGameButton extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 50, height: 20 }), new GridPosition({ x: 0, y: 0 })]])),
	TRenderable,
) {
	override drawPriority = DrawPriority.HUD;
	background = Resources.hudElement.startGame.resource.image;
	size = Resources.hudElement.startGame.size;
	position = PercentToReal(new GridPosition({ x: 50, y: 50 }));
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, canvasSize, canvasPosition, this.background);

		context.fillStyle = "#172634";
		context.font = `${canvasSize.height * 0.22}px title`;
		context.textAlign = "center";
		context.fillText("Start Game", canvasPosition.x, canvasPosition.y);
	}
}
