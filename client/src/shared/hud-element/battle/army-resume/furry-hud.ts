import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { TDrawable } from "../../../traits/render/drawable";
import { Furry } from "../../../../engine/army/battle/furry";
import { ScreenPosition } from "../../../position";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { IconResources } from "../../../../renderer/resources/icons.resources";
import { drawOutlinedText } from "./pixel-meter";

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

	// The flame shows the Fury the next trigger adds: Furry.increaseFurry increments furryIncrease before adding it.
	nextIncrease() {
		return this.furry.furryIncrease + 1;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		if (this.furry.amount <= 0) return;
		const canvasPosition = this.getCanvasPosition(context, position);
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		this.drawImage(context, canvasSize, canvasPosition, this.furryIcon);
		drawOutlinedText(
			context,
			`+${this.nextIncrease()}`,
			canvasPosition.x,
			canvasPosition.y + canvasSize.height * 0.18,
			canvasSize.height * 0.58,
		);
	}
}
