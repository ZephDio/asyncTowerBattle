import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../traits/render/drawable";
import { ScreenPosition } from "../../../position";
import { BattleCastle } from "../../../../engine/castle/battle/battle-castle";
import { TRenderable } from "../../../traits/render/renderable";
import { Resources } from "../../../../renderer/resources";
import { DrawPriority } from "../../../traits/render/image-drawable";

export class CastleLifeBar extends Derive(TRenderable, TDrawable) {
	drawPriority = DrawPriority.HUD;
	healthIcon = Resources.hudElement.icons.health.image
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
		const size = this.getCanvasSize(context, 12, 1.3, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, size, canvasPosition);
		context.fillStyle = "green";
		const lifeProportion = this.castle.stats.health / this.castle.stats.maxHealth;
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
		const iconPosition = this.getCanvasPosition(context,this.position.add(new ScreenPosition({ x: -6 , y: 0 })))
		this.drawImage(context, { width: size.width/5, height:size.height*1.5 },
			iconPosition, 
			 this.healthIcon)

			 context.fillStyle = "black";
			 context.textAlign = "center";
			 context.fillText(`${Math.round(this.castle.stats.health)}/${Math.round(this.castle.stats.maxHealth)}`, canvasPosition.x, canvasPosition.y + size.height/2
			  , size.width)
	}
}
