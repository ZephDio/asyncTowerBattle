import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../shared/hitbox/shapes/ellipse";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { Physic } from "../../../shared/physic";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../../stats/stats";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";

export class FrostNova extends Derive(
	TCollider,
	THitbox(new HitBox([[new Ellipse({ width: 9, height: 9 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	type = "frost-nova" as const;
	drawPriority = DrawPriority.NormalGridElement;
	lifespan = 12;
	hasTriggered = false;
	constructor(
		public position: GridPosition,
		public damage: number,
		public hooks: BattleArmyHooks,
	) {
		super({});
	}

	tick() {
		if (this.lifespan > 1 && !this.hasTriggered) {
			const enemies = this.hooks.searchEnemyInArea(this.position, this.hitbox);
			for (const enemy of enemies) {
				const distance = Physic.getDistance(this.position, enemy.position);
				enemy.takeHit(Math.max(9 / (9 - distance), 1) * this.damage);
				enemy.addCondition(new Frozen(78, (9 - distance) * 8));
			}
			this.hasTriggered = true;
		}
		this.lifespan--;
		if (this.lifespan <= 0) this.hooks.removeAreaEffect(this);
	}

	get size() {
		return {
			width: (this.hitbox.hitShapes[0]?.[0] as Ellipse).rx * 2,
			height: (this.hitbox.hitShapes[0]?.[0] as Ellipse).ry * 2,
		};
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 0.18;
		context.strokeStyle = "cyan";
		context.fillStyle = "cyan";
		context.lineWidth = 11;
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawEllipse(context, size, canvasPosition, scale);
		context.fill;
		context.globalAlpha = 1;
	}
}

export class Frozen extends Derive(Status) {
	key = "frozen" as const;
	override clock: number = 0;
	override stats: Stats;

	hasTriggered = false;

	constructor(
		public duration: number,
		public intensity: number,
	) {
		super({});
	}

	tick() {
		if (!this.hasTriggered) {
			this.stats.basePercentStat.movementSpeed -= this.intensity;
			this.hasTriggered = true;
		}
		this.clock++;
		this.stats.basePercentStat.movementSpeed += this.intensity / this.duration;
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this);
		}
	}

	override onRemove(): void {
		const remainingTime = this.duration - this.clock;
		this.stats.basePercentStat.movementSpeed += (this.intensity / this.duration) * remainingTime;
	}
}
