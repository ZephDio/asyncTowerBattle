import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../traits/render/drawable";
import { ScreenPosition } from "../../../position";
import { TRenderable } from "../../../traits/render/renderable";
import { DrawPriority } from "../../../traits/render/image-drawable";
import { AnyBattleCastle } from "../../../../engine/castle/battle";
import { IconResources } from "../../../../renderer/resources/icons.resources";
import { drawPixelMeter, LifeRamp, MeterIconOffset, MeterIconSide, MeterOffset, MeterSize } from "./pixel-meter";

export class CastleLifeBar extends Derive(TRenderable, TDrawable) {
	drawPriority = DrawPriority.HUD;
	healthIcon = IconResources.heartContainer.image;
	constructor(
		private castle: AnyBattleCastle,
		public position: ScreenPosition,
	) {
		super({});
	}

	override draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		const { health, maxHealth } = this.castle.stats;
		drawPixelMeter(
			context,
			this.getCanvasPosition(context, position.add(new ScreenPosition({ x: MeterOffset, y: 0 }))),
			this.getCanvasSize(context, MeterSize.width, MeterSize.height, scale),
			health / maxHealth,
			LifeRamp,
			`${Math.max(0, Math.round(health))}/${Math.round(maxHealth)}`,
		);
		const iconSize = this.getCanvasSize(context, MeterIconSide, MeterIconSide, scale);
		const iconPosition = this.getCanvasPosition(
			context,
			position.add(new ScreenPosition({ x: MeterIconOffset, y: 0 })),
		);
		this.drawImage(context, iconSize, iconPosition, this.healthIcon);
	}
}
