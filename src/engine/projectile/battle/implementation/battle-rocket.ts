import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Explosion } from "../../../area-effect/implementation/explosion";
import { PathFinder } from "../../../battle/path-finder";
import { Rocket } from "../../blueprint/implementation/rocket";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";

export class BattleRocket extends Derive(HTHitbox, HTImageDrawable, TRenderable) {
	pathFinder: PathFinder;
	speed: number;

	constructor(
		public projectile: Rocket,
		public position: Position,
		public hooks: BattleArmyHooks,
		public target: AnyBattleUnit,
		public damage: number,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.pathFinder = new PathFinder([new Position({ x: this.target.position.x, y: this.target.position.y })]);
		this.speed = this.projectile.baseSpeed;
		const theta = this.pathFinder.getOrientation(this.position);
		this.updateTheta(theta);
	}

	canMove(): boolean {
		return true;
	}

	isAlive(): boolean {
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

	updateTheta(theta: number) {
		this.angle = theta;
	}

	move(newPosition: Position) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}

	tick() {
		this.speed = this.speed + 0.12;
		this.followPath();
	}

	hit() {
		this.hooks.addAreaEffect(
			new Explosion(
				{ width: 10, height: 10 },
				new Position({ x: this.position.x, y: this.position.y }),
				this.damage,
				this.hooks,
			),
			this,
		);
		this.hooks.removeProjectile(this);
	}

	isAttacked(): void {
		return;
	}
}
