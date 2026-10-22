import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { HudElementResources } from "../../../renderer/resources/hud-element.resources";

export class BattleVerdictHud extends Derive(TDrawable, TRenderable) {
	constructor(
		public verdict: "Victory" | "Defeat",
		public position: ScreenPosition = PercentToReal({ x: 50, y: 50 }),
	) {
		super({});
	}
	size = { width: 32, height: 15 };
	background = HudElementResources.startGame.image;

	drawPriority = DrawPriority.HUD;

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, canvasSize, canvasPosition, this.background);
		context.fillStyle = "white";
		context.font = `${canvasSize.height * 0.22}px title`;
		context.textAlign = "center";
		if (this.verdict === "Victory") context.fillStyle = "#2E8B57";
		if (this.verdict === "Defeat") context.fillStyle = "#DC143C";
		context.fillText(this.verdict, canvasPosition.x, canvasPosition.y);
	}
}
