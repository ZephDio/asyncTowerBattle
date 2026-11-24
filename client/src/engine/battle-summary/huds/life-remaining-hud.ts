import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { MAX_LIVES } from "../../game-rules";
import { IconResources } from "../../../renderer/resources/icons.resources";

export class LifeRemainingHud extends Derive(TDrawable, TRenderable) {
	constructor(
		public life: number,
		public position: ScreenPosition = PercentToReal({ x: 50, y: 70 }),
	) {
		super({});
	}
	size = { width: 7.5, height: 7.5 };
	drawPriority = DrawPriority.HUD;

	heartIcon = IconResources.heartContainer.image;
	emptyHeartIcon = IconResources.emptyHeartContainer.image;

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		let heartPosition = position.add(new ScreenPosition({ x: -20, y: 0 }));
		for (let i = 0; i < MAX_LIVES; i++) {
			const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
			const canvasPosition = this.getCanvasPosition(context, heartPosition);
			const icon = i + 1 <= this.life ? this.heartIcon : this.emptyHeartIcon;
			this.drawImage(context, canvasSize, { x: canvasPosition.x + i * 5, y: canvasPosition.y }, icon);
			heartPosition = heartPosition.add(new ScreenPosition({ x: 10, y: 0 }));
		}
	}
}
