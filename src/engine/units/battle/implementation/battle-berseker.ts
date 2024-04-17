import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { Stats } from "../../../stats/stats";
import { PathFinder } from "../../../battle/path-finder";
import { BattlePath } from "../../../path/battle/battle-path";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Berseker } from "../../recruit/implementation/berseker-recruit";
import { Status } from "../../../../shared/traits/engine/status";
import { TBattleUnit } from "../battle-unit";

export class BattleBerseker extends Derive(TBattleUnit, Caster) {
	pathFinder: PathFinder;
	constructor(
		recruit: Berseker,
		public position: GridPosition,
		public enemyPath: BattlePath,

		private hooks: BattleArmyHooks,
	) {
		super({
			casterRecruit: recruit,
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

	attackCastle() {
		this.enemyPath.alliedCastle.takeDamage(this.stats.attack);
		this.castInProgress = null;
		this.hooks.removeUnit(this);
		this.stats._health = 0
	}
	casts() {
		if (this.pathFinder.isArrived) {
			this.castInProgress = new Cast(this, this.attackCastle.bind(this), 100);
			return;
		}
	}
	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}

	followPath(): void {
		if (this.canMove() && !this.pathFinder.isArrived) {
			const newPosition = this.pathFinder.getNextPosition(this.position, this.stats.movementSpeed);
			this.move(newPosition);
		}
	}

	tick() {
		this.stats.tick();
		if (this.stats.health <= this.stats.maxHealth / 2) {
			this.addStatus(new Enraged({}));
		}
		if (!this.pathFinder.isArrived) {
			this.followPath();
		}
		this.tickCast();
	}
}

export class Enraged extends Derive(Status) {
	key = "enraged";
	clock = 0;
	duration = 0;
	stats: Stats;
	didTrigger = false;
	tick() {
		if (this.didTrigger) return;
		this.stats.basePercentStat.movementSpeed += 50;
		this.stats.basePercentStat.attack += 25;
		this.didTrigger = true;
	}

	onRemove() {
		this.stats.basePercentStat.movementSpeed -= 50;
		this.stats.basePercentStat.attack -= 25;

		this.stats.removeStatus(this);
	}
}
