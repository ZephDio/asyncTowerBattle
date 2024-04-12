import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { TCollider } from "../traits/engine/core/TCollider";
import { TDrawable } from "../traits/render/drawable";
import { Resources } from "../../renderer/resources";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { ScreenPosition } from "../position";
import { TRenderable } from "../traits/render/renderable";
import { THitbox } from "../traits/engine/core/THitbox";

export class StartBattleButton extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 12, height: 6 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 1;
		const image = Resources.hudElement.startBattle.resource.image;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		this.drawImage(context, size, canvasPosition, image);
	}
	public type = "startBattle";
	public position = PercentToReal({ x: 67, y: 90 });

	size = { width: 12, height: 6 };
}
