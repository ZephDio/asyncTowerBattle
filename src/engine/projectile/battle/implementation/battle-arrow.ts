import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { Orientable } from "../../../../shared/traits/engine/core/orientable";
import { Arrow } from "../../blueprint/implementation/arrow";
import { Physic } from "../../../../shared/physic";

export class BattleArrow extends Derive(TRenderable, HTHitbox, HTImageDrawable, Orientable) {
	speed: number;

	constructor(
		public projectile: Arrow,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public damage: number,
		public vector: GridPosition,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.setOrientation(Physic.getTheta(this.position, this.position.add(this.vector)));
		this.speed = this.projectile.baseSpeed;
	}

	canMove() {
		return true;
	}

	followPath(): void {
		if (this.canMove()) {
			this.move(Physic.getNextPosition(this.position, this.orientation, this.speed));
			const found = this.hooks.searchEnemyInArea(this.position, this.hitbox)[0];
			if (found) {
				this.hit(found);
				this.hooks.removeProjectile(this);
			}
			if (
				this.position.x < 0 ||
				this.position.x > this.hooks.gridHooks.getBoundaries().maxX ||
				this.position.y < 0 ||
				this.position.y > this.hooks.gridHooks.getBoundaries().maxY
			) {
				this.hooks.removeProjectile(this);
			}
		}
	}

	tick() {
		this.followPath();
	}

	hit(found: AnyBattleUnit) {
		found.takeHit(this.damage);
	}

	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}
}
