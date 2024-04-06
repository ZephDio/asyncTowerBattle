import { Derive } from "@ddd-ts/traits";
import { Position } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { DragonRecruit } from "../../recruit/implementation/dragon-recruit";
import { PathFinder } from "../../../battle/path-finder";
import { HTImageDrawable, TLifeBarRenderable } from "../../../../shared/traits/drawable";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";

export class BattleDragon extends Derive(HTHitbox, TCollider, Caster, HTImageDrawable, TLifeBarRenderable, HaveStats) {
	pathFinder: PathFinder;

	constructor(
		recruit: DragonRecruit,
		public position: Position,
		public enemyPath: BattlePath,
		private hooks: BattleArmyHooks,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: recruit.maxLife,
			attack: recruit.attackDamage,
			movementSpeed: recruit.speed,
			castSpeed: recruit.attackSpeed,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}
	canMove() {
		return true;
	}

	isAlive() {
		return this.stats.health > 0;
	}

	onCastResolve() {
		this.enemyPath.alliedCastle.takeDamage(this.stats.attack);
		this.castInProgress = null;
	}
	casts(): void {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), 100);
	}

	takeDamage(damage: number) {
		this.stats.takeDamage(damage);
	}

	followPath(): void {
		if (this.canMove() && !this.pathFinder.isArrived) {
			const newPosition = this.pathFinder.getNextPosition(this.position, this.stats.movementSpeed);
			this.move(newPosition);
		}
	}

	move(newPosition: Position) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}

	tick() {
		this.stats.tick();
		if (!this.pathFinder.isArrived) {
			this.followPath();
			return;
		}

		this.tickCast();
	}

	get realPosition() {
		return this.position;
	}
}
