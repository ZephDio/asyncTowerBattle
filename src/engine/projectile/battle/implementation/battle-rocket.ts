import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Explosion } from "../../../area-effect/implementation/explosion";
import { PathFinder } from "../../../battle/path-finder";
import { Rocket } from "../../blueprint/implementation/rocket";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { Orientable } from "../../../../shared/traits/engine/core/orientable";

export class BattleRocket extends Derive(HTHitbox, HTImageDrawable, TRenderable, Orientable) {
	pathFinder: PathFinder;
	speed: number;

	constructor(
		public projectile: Rocket,
		public position: GridPosition,
		public hooks: BattleArmyHooks,
		public target: AnyBattleUnit,
		public damage: number,
	) {
		super({ hitboxHolder: projectile, imageDrawable: projectile });
		this.pathFinder = new PathFinder([new GridPosition({ x: this.target.position.x, y: this.target.position.y })]);
		this.speed = this.projectile.baseSpeed;
		const theta = this.pathFinder.getOrientation(this.position);
		this.setOrientation(theta);
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
			this.setOrientation(theta);
			this.move(nextPosition);
		}
		if (this.pathFinder.isArrived) {
			this.hit();
		}
	}


	move(newPosition: GridPosition) {
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
				new GridPosition({ x: this.position.x, y: this.position.y }),
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
