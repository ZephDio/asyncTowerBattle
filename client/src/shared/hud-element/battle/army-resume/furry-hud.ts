import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../traits/render/renderable";
import { TDrawable } from "../../../traits/render/drawable";
import { Furry } from "../../../../engine/army/battle/furry";
import { ScreenPosition } from "../../../position";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { IconResources } from "../../../../renderer/resources/icons.resources";
import { drawOutlinedText } from "./pixel-meter";
import { HudTooltip } from "./hud-tooltip";

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

	// Under the flame, the Fury the next trigger adds: Furry.increaseFurry increments furryIncrease before adding it.
	nextIncrease() {
		return this.furry.furryIncrease + 1;
	}

	// The flame and the number under it, while there is Fury to show.
	tooltipAt(point: ScreenPosition, side: "left" | "right"): HudTooltip | null {
		if (this.furry.amount <= 0) return null;
		const half = this.size.width / 2;
		const inside =
			Math.abs(point.x - this.position.x) <= half &&
			point.y <= this.position.y + half &&
			point.y >= this.position.y - this.size.height * 1.1;
		if (!inside) return null;
		return new HudTooltip(this.position, half, side, () => ({
			title: "Fury",
			lines: [
				`Current: ${Math.round(this.furry.amount)}`,
				`New units: +${Math.round(this.furry.amount)}% 💚 and 🥾`,
				`Next trigger: +${this.nextIncrease()}`,
				"Every 2 s from 20 s",
			],
		}));
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		if (this.furry.amount <= 0) return;
		const canvasPosition = this.getCanvasPosition(context, position);
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		this.drawImage(context, canvasSize, canvasPosition, this.furryIcon);
		drawOutlinedText(
			context,
			`${this.nextIncrease()}`,
			canvasPosition.x,
			canvasPosition.y + canvasSize.height * 0.78,
			canvasSize.height * 0.58,
		);
	}
}
