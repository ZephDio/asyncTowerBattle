import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { Drill } from "../../blueprint/implementation/drill";
import { Physic } from "../../../../shared/physic";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { Orientable } from "../../../../shared/traits/engine/core/orientable";

// Slowly bores straight ahead through every enemy on its way, hitting each one once, until it leaves the board.
export class BattleDrill extends Derive(TRenderable, HTHitbox, HTImageDrawable, Orientable) {
	speed: number;
	touchedTargets: Set<AnyBattleUnit> = new Set();

	boundaries: { minX: number; minY: number; maxX: number; maxY: number };

	constructor(
		public projectile: Drill,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public damage: number,
		public vector: GridPosition,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.setOrientation(Physic.getTheta(this.position, this.position.add(this.vector)));
		this.speed = this.projectile.baseSpeed;
		this.boundaries = this.hooks.gridHooks.getBoundaries();
	}

	canMove() {
		return true;
	}

	followPath(): void {
		this.move(Physic.getNextPosition(this.position, this.orientation, this.speed));
		for (const found of this.hooks.searchEnemyInArea(this.position, this.hitbox)) {
			if (this.touchedTargets.has(found)) continue;
			this.touchedTargets.add(found);
			this.hit(found);
		}
		if (
			this.position.x < this.boundaries.minX ||
			this.position.x > this.boundaries.maxX ||
			this.position.y < this.boundaries.minY ||
			this.position.y > this.boundaries.maxY
		) {
			this.hooks.removeProjectile(this);
		}
	}

	tick() {
		this.speed += this.projectile.acceleration;
		this.followPath();
	}

	hit(touched: AnyBattleUnit) {
		touched.takeHit(this.damage);
	}

	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}
}
