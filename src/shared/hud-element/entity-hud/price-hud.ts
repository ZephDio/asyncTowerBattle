import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../../traits/render/drawable";
import { Resources } from "../../../renderer/resources";
import { THasPrice } from "../../traits/engine/has-price";
import { ScreenPosition } from "../../position";

export class PriceHud extends Derive(TDrawable) {
	override drawPriority: 4;
	constructor(private buyable: ImplementsTrait<typeof THasPrice>) {
		super({});
	}
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		context.globalAlpha = 1;
		context.fillStyle = "yellow";
		const image = Resources.hudElement.gold.resource.image;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, 1.9, 1.9, scale);
		const text = this.buyable.price.toString();
		const textPosition = this.getCanvasPosition(context, new ScreenPosition({ x: position.x, y: position.y - 0.6 }));
		context.font = `${size.height}px Arial`;
		const textWidth = context.measureText(text).width;
		const offSet = (textWidth + 31) / 2;
		context.fillText(text, textPosition.x - offSet, textPosition.y);
		canvasPosition.x = canvasPosition.x + textWidth / 2;
		this.drawImage(context, size, canvasPosition, image);
	}
}
