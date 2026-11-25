import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../shared/hitbox/shapes/ellipse";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";

import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { STANDARD_CELL_SIZE } from "../../grid/tgrid";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../../stats/stats";
import { frameToSeconds } from "../../../shared/seconds";

// The damage a poisoned enemy takes each second, before the army's modifiers (the Cauldron).
export const POISON_DAMAGE_PER_SECOND = 6;

// Read from the army each time, so a modifier gained or lost during the battle applies at once.
export const poisonDamagePerSecond = (hooks: BattleArmyHooks) =>
	POISON_DAMAGE_PER_SECOND * (1 + hooks.alliedArmyBuffHooks.getPoisonDamagePercent() / 100);

export class PoisonGround extends Derive(
	TDrawable,
	TRenderable,
	TCollider,
	THitbox(
		new HitBox([
			[new Ellipse({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
) {
	type = "poison-ground" as const;
	drawPriority = DrawPriority.GroundEffect;
	clock = 0;
	constructor(
		public maxDuration: number,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
	) {
		super({});
	}

	tick() {
		if (this.clock++ > this.maxDuration) {
			this.hooks.removeAreaEffect(this);
			return;
		}
		const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
		for (const enemy of enemies) {
			enemy.addCondition(new Poisoned(this.damagePerSecond));
		}
	}

	// Read from the army each time, so a modifier gained or lost during the battle applies at once.
	damagePerSecond = () =>
		POISON_DAMAGE_PER_SECOND * (1 + this.hooks.alliedArmyBuffHooks.getPoisonDamagePercent() / 100);

	get size() {
		return {
			width: (this.hitbox.hitShapes[0]?.[0] as Ellipse).rx * 2,
			height: (this.hitbox.hitShapes[0]?.[0] as Ellipse).ry * 2,
		};
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 0.18;
		context.strokeStyle = "purple";
		context.fillStyle = "purple";
		context.lineWidth = 11;
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawEllipse(context, size, canvasPosition, scale);
		context.globalAlpha = 1;
	}
}

export class Poisoned extends Derive(Status) {
	key = "poisoned";
	clock = 0;
	duration: number;
	stats: Stats;

	constructor(
		public damagePerSecond: () => number,
		duration = 70,
	) {
		super({});
		this.duration = duration;
	}

	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this);
		}
		this.stats.takeDamage(this.damagePerSecond() * frameToSeconds(1));
	}

	stack(_status: Poisoned) {}

	onRemove() {}
}
