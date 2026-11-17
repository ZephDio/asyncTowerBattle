import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { TCollider } from "../traits/engine/core/TCollider";
import { TDrawable } from "../traits/render/drawable";
import { ScreenPosition } from "../position";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TRenderable } from "../traits/render/renderable";
import { THitbox } from "../traits/engine/core/THitbox";
import { IconResources } from "../../renderer/resources/icons.resources";

// The shop's reroll button. pressedAt is the performance.now() time of the last press: the "press" animation plays
// once from then, and the still bell is drawn before and after it.
export class RefreshBellHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 8, height: 8 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority: 5;

	constructor(public pressedAt: number | null = null) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 1;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const sheet = IconResources.bellPressSheet;
		const elapsed = this.pressedAt === null ? null : performance.now() - this.pressedAt;
		const duration = sheet.tagDuration("press");
		const frame = elapsed !== null && duration !== null && elapsed < duration ? sheet.frameAt("press", elapsed) : null;
		if (frame) {
			this.drawImage(context, size, canvasPosition, sheet.image, undefined, frame);
			return;
		}
		this.drawImage(context, size, canvasPosition, IconResources.bell.image);
	}
	public type = "bell";
	public position = PercentToReal({ x: 33, y: 95 });

	size = { width: 8, height: 8 };
}
