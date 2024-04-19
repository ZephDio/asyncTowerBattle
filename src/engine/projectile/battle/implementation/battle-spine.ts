import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { Spine } from "../../blueprint/implementation/spine";
import { Physic } from "../../../../shared/physic";
import { TRenderable } from "../../../../shared/traits/render/renderable";

export class BattleSpine extends Derive(TRenderable, HTHitbox, HTImageDrawable) {
	speed: number;
	touchedTargets: AnyBattleUnit[] = [];

	boundaries: { minX: number; minY: number; maxX: number; maxY: number };

	constructor(
		public projectile: Spine,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public damage: number,
		public vector: GridPosition,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.angle = Physic.getTheta(this.position, this.position.add(this.vector));
		this.speed = this.projectile.baseSpeed;
		this.boundaries = this.hooks.gridHooks.getBoundaries();
	}

	canMove() {
		return true;
	}

	followPath(): void {
		this.move(Physic.getNextPosition(this.position, this.angle, this.speed));
		const found = this.hooks.searchEnemyInArea(this.position, this.hitbox)[0];
		if (found) {
			this.hit(found);
			this.hooks.removeProjectile(this);
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
		this.followPath();
	}

	hit(touched: AnyBattleUnit) {
		touched.takeDamage(this.damage);
	}

	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}
}
