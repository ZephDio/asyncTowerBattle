import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { TDrawable } from "../../../traits/render/drawable";
import { Furry } from "../../../../engine/army/battle/furry";
import { ScreenPosition } from "../../../position";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { IconResources } from "../../../../renderer/resources/icons.resources";

export class FurryHud extends Derive(TRenderable, TDrawable) {
	furryIcon = IconResources.furry.image;

	size = { width: 4.5, height: 4.5 };
	drawPriority: DrawPriority = DrawPriority.HUD;
	constructor(
		public furry: Furry,
		public position: ScreenPosition,
	) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		if (this.furry.amount <= 0) return;
		const furryIconPosition = position.add(new ScreenPosition({ x: 2, y: 0 }));
		const multiplierPosition = position.add(new ScreenPosition({ x: -2, y: 1 }));
		const canvasFurryIconPosition = this.getCanvasPosition(context, furryIconPosition);
		const canvasMultiplierPosition = this.getCanvasPosition(context, multiplierPosition);
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		this.drawImage(context, canvasSize, canvasFurryIconPosition, this.furryIcon);
		context.textAlign = "center";
		context.font = `${canvasSize.height / 1.6}px text`;
		context.fillStyle = "green";
		context.fillText(
			`${Math.round(this.furry.amount)}`,
			canvasFurryIconPosition.x,
			canvasFurryIconPosition.y + canvasSize.height / 2,
			canvasSize.width,
		);
		context.fillStyle = "black";
		context.fillText(
			`X${Math.round(this.furry.furryIncrease)}`,
			canvasMultiplierPosition.x,
			canvasMultiplierPosition.y + canvasSize.height / 2,
			canvasSize.width,
		);
	}
}
