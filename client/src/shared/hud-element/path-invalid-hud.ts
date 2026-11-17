import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../traits/render/drawable";
import { ScreenPosition } from "../position";
import { TRenderable } from "../traits/render/renderable";
import { StartBattleButton } from "./start-battle-button";
import { DrawPriority } from "../traits/render/image-drawable";

// Shown above the start button while the path does not reach the castle, since the battle cannot start then.
export class PathInvalidHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	public position: ScreenPosition;
	fontSize = 2;

	constructor() {
		super({});
		const button = new StartBattleButton({});
		this.position = new ScreenPosition({
			x: button.position.x,
			y: button.position.y + button.size.height / 2 + 1,
		});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 1;
		context.fillStyle = "red";
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.fontSize, this.fontSize);
		context.font = `${size.height}px text`;
		const text = "Path invalid";
		context.fillText(text, canvasPosition.x - context.measureText(text).width / 2, canvasPosition.y);
	}
}
