import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { TCollider } from "../traits/engine/core/TCollider";
import { TDrawable } from "../traits/render/drawable";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { ScreenPosition } from "../position";
import { TRenderable } from "../traits/render/renderable";
import { THitbox } from "../traits/engine/core/THitbox";
import { HudElementResources } from "../../renderer/resources/hud-element.resources";

export class StartBattleButton extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 10, height: 4.3 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 1;
		const image = HudElementResources.startBattle.image;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		this.drawImage(context, size, canvasPosition, image);
	}
	public type = "startBattle";
	public position = PercentToReal({ x: 67, y: 91 });

	size = { width: 10, height: 4.3 };
}
