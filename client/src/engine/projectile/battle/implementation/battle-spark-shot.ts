import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { EmberSpark } from "../../blueprint/implementation/ember-spark";
import { Physic } from "../../../../shared/physic";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { Orientable } from "../../../../shared/traits/engine/core/orientable";

// Flies straight along its direction for `range`, and stops on the first enemy it touches, which it hurts. It goes out
// there, or at the end of its range.
export class BattleSparkShot extends Derive(TRenderable, HTHitbox, HTImageDrawable, Orientable) {
	travelled = 0;

	constructor(
		public projectile: EmberSpark,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public damage: number,
		direction: GridPosition,
		public range: number,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.setOrientation(Physic.getTheta(this.position, this.position.add(direction)));
	}

	canMove() {
		return true;
	}

	tick() {
		// The last step is shortened to end exactly at the range, instead of going past it.
		const speed = Math.min(this.projectile.baseSpeed, this.range - this.travelled);
		const next = Physic.getNextPosition(this.position, this.orientation, speed);
		this.position.x = next.x;
		this.position.y = next.y;
		this.travelled += speed;
		const struck = this.hooks.searchEnemyInArea(this.position, this.hitbox).find((found) => found.isAlive());
		if (struck) {
			struck.takeHit(this.damage);
			this.hooks.removeProjectile(this);
			return;
		}
		if (this.travelled >= this.range) this.hooks.removeProjectile(this);
	}
}
