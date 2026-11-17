import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../shared/hitbox/shapes/ellipse";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import type { AnyBattleUnit } from "../../units/battle/battle-unit";
import { Regeneration } from "../../stats/status/regeneration";

// Diameter of a puff, in grid units. The paradise bird drops one each time it has walked this far.
export const POWDER_PUFF_SIZE = 3;

// The paradise bird's feather colors.
const POWDER_COLORS = ["#e2448c", "#face3c", "#34beb4", "#4678dc"];
// Where the powder grains sit in a puff, as fractions of its radius. Each puff turns the pattern by its index so the
// trail doesn't repeat.
const GRAINS = [
	{ x: -0.6, y: -0.2 },
	{ x: -0.2, y: 0.5 },
	{ x: 0.1, y: -0.6 },
	{ x: 0.5, y: 0.2 },
	{ x: 0.2, y: 0.05 },
	{ x: -0.35, y: -0.65 },
	{ x: 0.65, y: -0.35 },
];

// A puff of feather powder the paradise bird leaves behind as it walks: it gives the other allies standing in it a
// short regeneration, and fades away. Puffs overlap and several birds can share a path, but a unit in several puffs
// only gets its regeneration restarted, see Regeneration.
export class PowderTrail extends Derive(
	TDrawable,
	TRenderable,
	TCollider,
	THitbox(
		new HitBox([
			[new Ellipse({ width: POWDER_PUFF_SIZE, height: POWDER_PUFF_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
) {
	type = "powder-trail" as const;
	drawPriority = DrawPriority.GroundEffect;
	clock = 0;
	constructor(
		public maxDuration: number,
		public position: GridPosition,
		public heal: number,
		public regenerationTicks: number,
		public dropper: AnyBattleUnit,
		public index: number,
		public hooks: BattleArmyHooks,
	) {
		super({});
	}

	tick() {
		if (this.clock++ > this.maxDuration) {
			this.hooks.removeAreaEffect(this);
			return;
		}
		const allies = this.hooks.searchAlliesInArea(this.position, this.hitbox);
		for (const ally of allies) {
			if (ally === this.dropper) continue;
			ally.addBoon(new Regeneration(this.heal, this.regenerationTicks));
		}
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const center = this.getCanvasPosition(context, position);
		const radius = this.getCanvasSize(context, POWDER_PUFF_SIZE / 2, POWDER_PUFF_SIZE / 2, scale).width;
		const grain = Math.max(2, radius / 4);
		const angle = this.index * 2.4;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		// The clock runs one tick past maxDuration before the puff is removed. Clamp, as the canvas ignores a negative
		// alpha and would draw that last frame fully opaque.
		const fade = 1 - this.clock / this.maxDuration;
		if (fade <= 0) return;
		context.globalAlpha = 0.8 * fade;
		GRAINS.forEach((offset, i) => {
			context.fillStyle = POWDER_COLORS[(i + this.index) % POWDER_COLORS.length] ?? "white";
			const x = center.x + (offset.x * cos - offset.y * sin) * radius;
			const y = center.y + (offset.x * sin + offset.y * cos) * radius;
			context.fillRect(x - grain / 2, y - grain / 2, grain, grain);
		});
		context.globalAlpha = 1;
	}
}
