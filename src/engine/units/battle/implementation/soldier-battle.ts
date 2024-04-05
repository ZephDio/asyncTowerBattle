import { Derive } from "@ddd-ts/traits";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { SoldierRecruit } from "../../recruit/implementation/soldier-recruit";
import { PathFinder } from "../../../battle/path-finder";
import { Caster } from "../../../../shared/traits/cast";
import { HTImageDrawable, TLifeBarRenderable } from "../../../../shared/traits/drawable";
import { HaveStats } from "../../../stats/stats";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";

export class BattleSoldier extends Derive(HTHitbox, TCollider, Caster, HTImageDrawable, TLifeBarRenderable, HaveStats) {
	pathFinder: PathFinder;

	constructor(
		recruit: SoldierRecruit,
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

	onCastResolve(): void {
		this.enemyPath.alliedCastle.takeDamage(this.stats.attack);
		this.cast = null;
	}

	isAlive() {
		return this.stats.health > 0;
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

	takeDamage(damage: number): void {
		this.stats.takeDamage(damage);
	}

	tick() {
		this.stats.tick();
		if (!this.pathFinder.isArrived) {
			this.followPath();
			return;
		}
		this.tickCast();
	}
}
