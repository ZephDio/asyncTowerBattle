import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, TCollider, THitbox } from "../hitboxes";
import { TDrawable } from "../traits/tdrawable";

import { ScreenPosition } from "../position";
import { Resources } from "../../renderer/resources";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TRenderable } from "../traits/trenderable";

export class RefreshBellHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 8, height: 8 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 1;
		const image = Resources.hudElement.bell.resource.image;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		this.drawImage(context, size, canvasPosition, image);
	}
	public type = "bell";
	public position = PercentToReal({ x: 33, y: 95 });

	size = { width: 8, height: 8 };
}
