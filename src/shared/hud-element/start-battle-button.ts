import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, TCollider, THitbox } from "../hitboxes";
import { TDrawable } from "../traits/tdrawable";
import { TRenderable } from "../traits/drawable";
import { Position } from "../position";
import { Resources } from "../../renderer/resources";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";

export class StartBattleButton extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 12, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: Position): void {
		context.globalAlpha = 1;
		const image = Resources.hudElement.startBattle.resource.image;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		this.drawImage(context, size, canvasPosition, image);
	}
	public type = "startBattle";
	public position = PercentToReal({ x: 50, y: 90 });

	size = { width: 12, height: 6 };
}
