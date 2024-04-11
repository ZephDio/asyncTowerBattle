import { Derive } from "@ddd-ts/traits";
import { Ellipse, HitBox, TCollider, THitbox } from "../../../shared/hitboxes";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable } from "../../../shared/traits/tdrawable";
import { Physic } from "../../../shared/physic";
import { Status } from "../../../shared/traits/status";
import { Stats } from "../../stats/stats";
import { TRenderable } from "../../../shared/traits/trenderable";

export class FrostNova extends Derive(
	TCollider,
	THitbox(new HitBox([[new Ellipse({ width: 9, height: 9 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	type = "frost-nova" as const;
	drawPriority = 5;
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
				enemy.takeDamage(Math.max(9 / (9 - distance), 1) * this.damage);
				enemy.addStatus(new Frozen(78, (9 - distance) * 8));
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

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, cellSize: number): void {
		context.globalAlpha = 0.18;
		context.strokeStyle = "cyan";
		context.fillStyle = "cyan";
		context.lineWidth = 11;
		const scale = cellSize / 4.9;
		const size = this.getCanvasSize(context, this.size.width, this.size.height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawEllipse(context, size, canvasPosition, scale);
		context.fill;
	}
}

export class Frozen extends Derive(Status) {
	override key: "frozen";
	override clock: number = 0;
	override stats: Stats;
	type = "frozen" as const;

	hasTriggered = false;

	override stackable = false;

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
			this.stats.removeStatus(this);
		}
	}
}
