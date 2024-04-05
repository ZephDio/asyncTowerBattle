import { PercentToReal } from "../renderer/implementation/canvas-renderer";
import { HitBox, Rectangle, TCollider, THitbox } from "./hitboxes";
import { Position } from "./position";

import { TRenderable } from "./traits/drawable";
import { Resources } from "../renderer/resources";
import { Derive } from "../../traits/traits";
import { TDrawable } from "./traits/tdrawable";

export type HudElement = StartBattleButton | GoldDisplay;

export class StartBattleButton extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 12, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: Position): void {
		context.globalAlpha = 1;
		const image = Resources.hudElement.startBattle.resource.image;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		this.drawImage(context, size, canvasPosition, image);
	}
	public type = "startBattle";
	public position = PercentToReal({ x: 50, y: 90 });

	size = { width: 12, height: 6 };
}

export class GoldDisplay extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new Position({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	constructor(public gold: number) {
		super({});
	}
	drawPriority: 5;
	draw(context: CanvasRenderingContext2D, position: Position): void {
		context.globalAlpha = 1;
		context.fillStyle = "yellow";
		const image = Resources.hudElement.gold.resource.image;
		const unitPosition = this.getCanvasPosition(context, new Position({ x: position.x - 5, y: position.y - 1 }));
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const text = this.gold.toString();
		context.font = `${size.height}px Arial`;
		const textWidth = context.measureText(text).width;
		context.fillText(text, unitPosition.x + size.width - textWidth, unitPosition.y);
		this.drawImage(context, size, canvasPosition, image);
	}
	public type = "goldDisplay";
	public position = PercentToReal({ x: 8, y: 96 });
	public size = { width: 3, height: 3 };
}
