import { Derive } from "@ddd-ts/traits";
import { ScreenPosition } from "../position";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";
import { drawShopPanel } from "../traits/render/shop-panel";

export class ShopSignHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	position = new ScreenPosition({ x: 7.1, y: 57.4 });

	readonly size = { width: 9, height: 4.5 };

	contains(point: ScreenPosition) {
		return Math.abs(point.x - this.position.x) <= this.size.width / 2 &&
			Math.abs(point.y - this.position.y) <= this.size.height / 2;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		const { x, y } = this.getCanvasPosition(context, position);
		const { width, height } = this.getCanvasSize(context, this.size.width, this.size.height);
		context.save();
		context.globalAlpha = 1;
		drawShopPanel(context, x - width / 2, y - height / 2, width, height, height);
		context.font = `${height * 0.58}px title`;
		context.fillStyle = "#ffe5ad";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText("SHOP", x, y);
		context.restore();
	}
}
