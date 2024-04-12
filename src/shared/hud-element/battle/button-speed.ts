import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../hitbox/hitboxe";
import { THitbox } from "../../traits/engine/core/THitbox";
import { TCollider } from "../../traits/engine/core/TCollider";
import { TRenderable } from "../../traits/render/renderable";
import { Resources } from "../../../renderer/resources";
import { TDrawable } from "../../traits/render/drawable";
import { ScreenPosition } from "../../position";
import { Rectangle } from "../../hitbox/shapes/rectangle";

export class ButtonSpeedHUD extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 4 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	override drawPriority = 8;
	size = { width: 4, height: 4 };
	constructor(
		public speed: number,
		public position: ScreenPosition,
	) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		const { timesOne, timesTwo, timesThree } = Resources.hudElement.speedButton.resource.image;
		const image = this.speed === 1 ? timesOne : this.speed === 2 ? timesTwo : timesThree;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		this.drawImage(context, size, canvasPosition, image);
	}
}
