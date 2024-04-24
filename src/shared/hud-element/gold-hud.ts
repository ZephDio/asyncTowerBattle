import { Resources } from "../../renderer/resources";
import { Derive } from "@ddd-ts/traits";

import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TDrawable } from "../traits/render/drawable";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { TCollider } from "../traits/engine/core/TCollider";
import { ScreenPosition } from "../position";
import { TRenderable } from "../traits/render/renderable";
import { THitbox } from "../traits/engine/core/THitbox";

export class GoldHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	constructor(public gold: number) {
		super({});
	}
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		context.fillStyle = "yellow";
		const image = Resources.hudElement.gold.resource.image;
		const unitPosition = this.getCanvasPosition(context, new ScreenPosition({ x: position.x - 5, y: position.y - 1 }));
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const text = this.gold.toString();
		context.font = `${size.height}px text`;
		const textWidth = context.measureText(text).width;
		context.fillText(text, unitPosition.x + size.width - textWidth, unitPosition.y);
		this.drawImage(context, size, canvasPosition, image);
	}
	public type = "goldDisplay";
	public position = PercentToReal({ x: 8, y: 96 });
	public size = { width: 3, height: 3 };
}
