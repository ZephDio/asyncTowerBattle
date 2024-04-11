import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathFinder } from "../../../battle/path-finder";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { FrostSpike } from "../../blueprint/implementation/frost-spike";
import { FrostNova } from "../../../area-effect/implementation/frost-nova";
import { TRenderable } from "../../../../shared/traits/trenderable";

export class BattleFrostSpike extends Derive(TRenderable, HTHitbox, HTImageDrawable) {
	pathFinder: PathFinder;
	speed: number;

	constructor(
		public projectile: FrostSpike,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public target: AnyBattleUnit,
		public damage: number,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.pathFinder = new PathFinder([target.position.clone()]);
		this.speed = 0;
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
		this.speed += 0.3;
	}

	hit() {
		this.hooks.addAreaEffect(new FrostNova(this.position.clone(), this.damage, this.hooks), this);
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
