import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../traits/render/drawable";
import { ScreenPosition } from "../../../position";
import { BattleFoodEconomy } from "../../../../engine/food/battle-food-economy";
import { TRenderable } from "../../../traits/render/renderable";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { IconResources } from "../../../../renderer/resources/icons.resources";
import {
	drawOutlinedText,
	drawPixelMeter,
	FamineColor,
	FamineRamp,
	FoodRamp,
	MeterIconOffset,
	MeterIconSide,
	MeterOffset,
	MeterSize,
} from "./pixel-meter";

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
		// While the army's food payments are blocked, the meter turns grey in a red frame with a FAMINE label under it.
		const famine = this.economy.isFamine();
		drawPixelMeter(
			context,
			this.getCanvasPosition(context, position.add(new ScreenPosition({ x: MeterOffset, y: 0 }))),
			this.getCanvasSize(context, MeterSize.width, MeterSize.height, scale),
			this.economy.food / this.economy.maxFood,
			famine ? FamineRamp : FoodRamp,
			`${Math.round(this.economy.food)}/${Math.round(this.economy.maxFood)}`,
			famine,
		);
		const iconSize = this.getCanvasSize(context, MeterIconSide, MeterIconSide, scale);
		const iconPosition = this.getCanvasPosition(
			context,
			position.add(new ScreenPosition({ x: MeterIconOffset, y: 0 })),
		);
		this.drawImage(context, iconSize, iconPosition, this.foodIcon);

		if (famine) {
			const labelPosition = this.getCanvasPosition(
				context,
				position.add(new ScreenPosition({ x: MeterOffset, y: -MeterSize.height * 1.15 })),
			);
			const fontSize = this.getCanvasSize(context, 0, MeterSize.height * 1.1, scale).height;
			drawOutlinedText(context, "FAMINE", labelPosition.x, labelPosition.y, fontSize, FamineColor);
		}
	}
}
