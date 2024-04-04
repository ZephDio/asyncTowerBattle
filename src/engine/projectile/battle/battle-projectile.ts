import { Position } from "../../../shared/position";
import { PathFinder } from "../../battle/path-finder";
import { Physic } from "../../../shared/physic";
import { Projectile } from "../entity/projectile";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyBattleUnit } from "../../units/recruit/unit-recruit";
import { Derive } from "@ddd-ts/traits";
import { TRenderable } from "../../../shared/traits/drawable";
import { TDrawable } from "../../../shared/traits/tdrawable";

export abstract class BattleProjectile<PR extends Projectile> extends Derive(TDrawable, TRenderable) {
	pathFinder: PathFinder;
	speed: number;
	angle: number;
	constructor(
		public projectile: PR,
		public position: Position,
		public hooks: BattleArmyHooks,
		public target: AnyBattleUnit,
		public damage: number,
	) {
		super({});
		this.angle = Physic.getTheta(position, target.position);
		this.pathFinder = new PathFinder([target.position]);
		this.speed = this.projectile.baseSpeed;
	}

	abstract canMove(): boolean;

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

	move(newPosition: Position) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}
}
