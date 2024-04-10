import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathFinder } from "../../../battle/path-finder";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { Bullet } from "../../blueprint/implementation/bullet";

export class BattleBullet extends Derive(TRenderable, HTHitbox, HTImageDrawable) {
	pathFinder: PathFinder;
	speed: number;

	constructor(
		public projectile: Bullet,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public target: AnyBattleUnit,
		public damage: number,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.pathFinder = new PathFinder([target.position]);
		this.speed = this.projectile.baseSpeed;
	}

	canMove() {
		return true;
	}

	followPath(): void {
		if (this.canMove() && !this.pathFinder.isArrived) {
			const [nextPosition, theta] = this.pathFinder.getNextPositionAndOrientation(this.position, this.speed);

			this.updateTheta(theta);
			this.move(nextPosition);
		}
		if (this.pathFinder.isArrived) {
			this.hit();
		}
	}

	tick() {
		this.followPath();
	}

	hit() {
		this.target.takeDamage(this.damage);
		this.hooks.removeProjectile(this);
	}

	updateTheta(theta: number) {
		this.angle = theta;
	}

	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}
}
