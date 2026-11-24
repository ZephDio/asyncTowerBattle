import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";

// The red cross as pixels: 1 is a red pixel, 0 is nothing.
const CROSS = ["1100011", "1110111", "0111110", "0011100", "0111110", "1110111", "1100011"];
const CROSS_RED = "#c8322d";
const CROSS_SHADOW = "#5e1412";

// Drops the game the player left running, so the menu offers a new one again.
export class ConcedeButton extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 22, height: 7 }), new GridPosition({ x: 0, y: 0 })]])),
	TRenderable,
) {
	override drawPriority = DrawPriority.HUD;
	size = { width: 22, height: 7 };
	position = PercentToReal(new GridPosition({ x: 50, y: 38 }));
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const center = this.getCanvasPosition(context, position);
		const left = center.x - canvasSize.width / 2;
		const top = center.y - canvasSize.height / 2;
		const border = canvasSize.height * 0.08;

		context.fillStyle = "#172634";
		context.fillRect(left, top, canvasSize.width, canvasSize.height);
		context.fillStyle = "#e8d9a8";
		context.fillRect(left + border, top + border, canvasSize.width - 2 * border, canvasSize.height - 2 * border);

		const pixel = Math.floor((canvasSize.height * 0.6) / CROSS.length);
		const crossLeft = left + canvasSize.width * 0.12;
		const crossTop = center.y - (pixel * CROSS.length) / 2;
		CROSS.forEach((row, y) => {
			[...row].forEach((value, x) => {
				if (value !== "1") return;
				context.fillStyle = CROSS_SHADOW;
				context.fillRect(crossLeft + x * pixel + pixel * 0.2, crossTop + y * pixel + pixel * 0.2, pixel, pixel);
				context.fillStyle = CROSS_RED;
				context.fillRect(crossLeft + x * pixel, crossTop + y * pixel, pixel, pixel);
			});
		});

		context.fillStyle = "#172634";
		context.font = `${canvasSize.height * 0.4}px title`;
		context.textAlign = "center";
		context.fillText("Concede", center.x + canvasSize.width * 0.1, center.y + canvasSize.height * 0.14);
	}
}
