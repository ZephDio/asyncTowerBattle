import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../traits/render/drawable";
import { ScreenPosition } from "../../../position";
import { BattleFoodEconomy } from "../../../../engine/food/battle-food-economy";
import { TRenderable } from "../../../traits/render/renderable";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { IconResources } from "../../../../renderer/resources/icons.resources";

export class FoodBarHud extends Derive(TRenderable, TDrawable) {
	drawPriority = DrawPriority.HUD;
	foodIcon = IconResources.food.image;
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
		const size = this.getCanvasSize(context, 12, 1.3, scale);
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
		const iconPosition = this.getCanvasPosition(context, this.position.add(new ScreenPosition({ x: -6, y: 0 })));
		const iconSide = size.height * 1.5;
		this.drawImage(context, { width: iconSide, height: iconSide }, iconPosition, this.foodIcon);

		context.fillStyle = "black";
		context.textAlign = "center";
		context.font = `${size.height * 1.5}px text`;
		context.fillText(
			`${Math.round(this.economy.food)}/${Math.round(this.economy.maxFood)}`,
			canvasPosition.x,
			canvasPosition.y + size.height / 2,
			size.width,
		);

		// The famine alert: a red label just above the bar while the army's food payments are blocked.
		if (this.economy.isFamine()) {
			context.fillStyle = "red";
			context.fillText("FAMINE", canvasPosition.x, canvasPosition.y - size.height * 0.8, size.width);
		}
	}
}
