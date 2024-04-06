import { BattleRocket } from "./implementation/battle-rocket";
import { BattleBullet } from "./implementation/battle-bullet";

export type AnyBattleProjectile = BattleRocket | BattleBullet;

// export abstract class BattleProjectile<PR extends AnyProjectile> extends Derive(TDrawable, TRenderable, HTHitbox) {
// 	pathFinder: PathFinder;
// 	speed: number;
// 	angle: number;
// 	constructor(
// 		public projectile: PR,
// 		public position: Position,
// 		public hooks: BattleArmyHooks,
// 		public target: AnyBattleUnit,
// 		public damage: number,
// 	) {
// 		super({ hitboxHolder: projectile });
// 		this.angle = Physic.getTheta(position, target.position);
// 		this.pathFinder = new PathFinder([target.position]);
// 		this.speed = this.projectile.baseSpeed;
// 	}

// 	abstract canMove(): boolean;

// 	followPath(): void {
// 		if (this.canMove() && !this.pathFinder.isArrived) {
// 			const [nextPosition, theta] = this.pathFinder.getNextPositionAndOrientation(this.position, this.speed);
// 			this.updateTheta(theta);
// 			this.move(nextPosition);
// 		}
// 		if (this.pathFinder.isArrived) {
// 			this.hit();
// 		}
// 	}

// 	tick() {
// 		this.followPath();
// 	}

// 	hit() {
// 		this.target.takeDamage(this.damage);
// 		this.hooks.removeProjectile(this);
// 	}

// 	updateTheta(theta: number) {
// 		this.angle = theta;
// 	}

// 	move(newPosition: Position) {
// 		this.position.x = newPosition.x;
// 		this.position.y = newPosition.y;
// 	}
// }
