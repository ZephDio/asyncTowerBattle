import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { Spine } from "../../blueprint/implementation/spine";
import { Physic } from "../../../../shared/physic";

export class BattleSpine extends Derive(TRenderable, HTHitbox, HTImageDrawable) {
	speed: number;
	touchedTargets: AnyBattleUnit[] = [];

	boundaries: { minX: number; minY: number; maxX: number; maxY: number };

	constructor(
		public projectile: Spine,
		public position: Position,
		public hooks: BattleArmyHooks,
		public damage: number,
		public vector: Position,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.angle = Physic.getTheta(this.position, this.position.add(this.vector));
		console.log(this.angle);
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

	move(newPosition: Position) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}
}
