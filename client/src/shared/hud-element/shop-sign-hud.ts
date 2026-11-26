import { Derive } from "@ddd-ts/traits";
import { ScreenPosition } from "../position";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";
import { drawWoodSign } from "../traits/render/wood-sign";

export class ShopSignHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	position = new ScreenPosition({ x: 10, y: 57.4 });

	readonly size = { width: 9, height: 4.5 };

	contains(point: ScreenPosition) {
		return (
			Math.abs(point.x - this.position.x) <= this.size.width / 2 &&
			Math.abs(point.y - this.position.y) <= this.size.height / 2
		);
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		const center = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		drawWoodSign(context, center, size, this.getCanvasSize(context, 1, 1).width, "SHOP");
	}
}
