import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { HTImageDrawable, TSpreadRenderable } from "../../../../shared/traits/drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathFinder } from "../../../battle/path-finder";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { Spark } from "../../blueprint/implementation/spark";

export class BattleSpark extends Derive(HTHitbox, HTImageDrawable, TSpreadRenderable) {
	pathFinder: PathFinder;
	speed: number;

	bounce = 5;
	spreading: boolean = false;

	constructor(
		public projectile: Spark,
		public position: Position,
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
		this.spreadPositions.push(this.position.clone());
		this.spread();
	}

	spread() {
		this.spreading = true;
		let lastTarget: AnyBattleUnit = this.target;
		for (let i = 0; i < this.bounce; i++) {
			const nextTarget = this.hooks.searchClosestArrivingEnemyUnitFrom(lastTarget.position);
			if (!nextTarget) {
				this.hooks.removeProjectile(this);
				return;
			}
			if (nextTarget === lastTarget) {
				continue;
			}
			lastTarget = nextTarget;
			this.spreadPositions.push(lastTarget.position.clone());
			nextTarget.takeDamage(this.damage / 2);
		}
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
