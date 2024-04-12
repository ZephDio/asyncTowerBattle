import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../traits/render/drawable";
import { ScreenPosition } from "../../position";
import { BattleCastle } from "../../../engine/castle/battle/battle-castle";
import { TRenderable } from "../../traits/render/renderable";

export class CastleLifeBar extends Derive(TRenderable, TDrawable) {
	drawPriority = 3;
	constructor(
		private castle: BattleCastle,
		public position: ScreenPosition,
	) {
		super({});
	}

	override draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		context.fillStyle = "red";
		context.strokeStyle = "black";
		context.lineWidth = 1;
		const size = this.getCanvasSize(context, 8, 1.3, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, size, canvasPosition);
		context.fillStyle = "green";
		const lifeProportion = this.castle.actualLife / this.castle.maxLife;
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
