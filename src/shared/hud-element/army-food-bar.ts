import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../traits/render/drawable";
import { ScreenPosition } from "../position";
import { BattleFoodEconomy } from "../../engine/food/battle-food-economy";
import { TRenderable } from "../traits/render/renderable";

export class FoodBarHud extends Derive(TRenderable, TDrawable) {
	drawPriority = 3;
	constructor(
		private economy: BattleFoodEconomy,
		public position: ScreenPosition,
	) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		context.fillStyle = "yellow";
		context.strokeStyle = "cyan";
		const size = this.getCanvasSize(context, 11, 1.3, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, size, canvasPosition);
		context.fillStyle = "lime";
		const foodProportion = this.economy.food / this.economy.maxFood;
		this.drawRectangle(
			context,
			{
				width: size.width * foodProportion,
				height: size.height,
			},
			new ScreenPosition({
				x: canvasPosition.x - foodProportion - (size.width / 2) * (1 - foodProportion),
				y: canvasPosition.y,
			}),
		);
	}
}
