import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { ScreenPosition } from "../position";
import { TCollider } from "../traits/engine/core/TCollider";
import { THitbox } from "../traits/engine/core/THitbox";
import { TokenUnit } from "../traits/engine/token-unit";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";

const OUTLINE = "#1d1d1c";
const PANEL_FILL = "#3b2a22";
const PANEL_RIM = "#c8955a";
const TEXT = "#fff4dc";

// Sizes in screen units: the "Basic unit" label sits above the slot showing the unit.
const LABEL = { width: 10, height: 3.4 };
const SLOT = 5.6;
const GAP = 0.8;
const HEIGHT = LABEL.height + GAP + SLOT;

// The army's basic unit, the one the castle and the barracks without a unit spawn, shown left of the castle in the
// shop. It can't be picked up; hovering it shows its description.
export class DefaultUnitHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: LABEL.width, height: HEIGHT }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority = DrawPriority.HUD;
	position = PercentToReal({ x: 7.5, y: 43 });

	constructor(public unit: ImplementsTrait<typeof TokenUnit>) {
		super({});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.save();
		context.globalAlpha = 1;
		const unit = this.getCanvasSize(context, 1, 1).width;
		const center = this.getCanvasPosition(context, position);
		const top = center.y - (HEIGHT * unit) / 2;

		const label = { width: LABEL.width * unit, height: LABEL.height * unit };
		this.drawPanel(context, center.x - label.width / 2, top, label.width, label.height, unit);
		const fontSize = unit * 1.9;
		context.font = `${fontSize}px title`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.lineJoin = "round";
		context.lineWidth = unit * 0.35;
		context.strokeStyle = OUTLINE;
		// The font's "middle" baseline sits a bit above the letters' visual center, so nudge them down.
		const textY = top + label.height / 2 + fontSize * 0.08;
		context.strokeText("Basic unit", center.x, textY, label.width - unit);
		context.fillStyle = TEXT;
		context.fillText("Basic unit", center.x, textY, label.width - unit);

		const slot = SLOT * unit;
		const slotTop = top + label.height + GAP * unit;
		this.drawPanel(context, center.x - slot / 2, slotTop, slot, slot, unit);
		if (implementsTrait(this.unit, TDrawable)) {
			const slotCenter = position.add(new ScreenPosition({ x: 0, y: HEIGHT / 2 - LABEL.height - GAP - SLOT / 2 }));
			this.unit.draw(context, slotCenter, 1.5);
		}
		context.restore();
	}

	// A rounded wooden panel: a thick dark outline, a wooden fill and a light rim inside the outline, as on the
	// rarity odds.
	drawPanel(context: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, unit: number) {
		const radius = unit * 1.2;
		context.beginPath();
		context.roundRect(left, top, width, height, radius);
		context.fillStyle = PANEL_FILL;
		context.fill();
		context.lineWidth = unit * 0.5;
		context.strokeStyle = OUTLINE;
		context.stroke();
		const inset = unit * 0.4;
		context.beginPath();
		context.roundRect(left + inset, top + inset, width - 2 * inset, height - 2 * inset, radius - inset);
		context.lineWidth = unit * 0.15;
		context.strokeStyle = PANEL_RIM;
		context.stroke();
	}
}
