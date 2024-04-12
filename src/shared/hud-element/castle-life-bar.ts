import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../traits/render/drawable";
import { HaveStats } from "../../engine/stats/stats";
import { ScreenPosition } from "../position";

export class CastleLifeBar extends Derive(TDrawable) {
	drawPriority = 3;
	constructor(private entity: ImplementsTrait<typeof HaveStats>) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		if (this.entity.stats.health === this.entity.stats.maxHealth) return;
		context.globalAlpha = 1;
		context.fillStyle = "red";
		context.strokeStyle = "cyan";
		const size = this.getCanvasSize(context, 3, 0.5, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, size, canvasPosition);
		context.fillStyle = "green";
		const lifeProportion = this.entity.stats.health / this.entity.stats.maxHealth;
		this.drawRectangle(
			context,
			{
				width: size.width * lifeProportion,
				height: size.height,
			},
			new ScreenPosition({
				x: canvasPosition.x - lifeProportion - (size.width / 2) * (1 - lifeProportion),
				y: canvasPosition.y,
			}),
		);
	}
}
