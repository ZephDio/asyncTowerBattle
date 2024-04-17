import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { Priest } from "../../recruit/implementation/priest-recruit";
import { HealWave } from "../../../area-effect/implementation/heal-wave";
import { GridPosition } from "../../../../shared/position";
import { TBattleUnit } from "../battle-unit";

export class BattlePriest extends Derive(TBattleUnit, Caster) {
	pathFinder: PathFinder;

	constructor(
		recruit: Priest,
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

	healWave() {
		this.hooks.addAreaEffect(new HealWave(30, this.position, 0.2, this.hooks), this);
		this.castInProgress = null;
	}

	casts(): void {
		if (this.pathFinder.isArrived) {
			this.castInProgress = new Cast(this, this.attackCastle.bind(this), 100);
			return;
		}
		this.castInProgress = new Cast(this, this.healWave.bind(this), 400);
	}

	followPath(): void {
		if (this.canMove() && !this.pathFinder.isArrived) {
			const newPosition = this.pathFinder.getNextPosition(this.position, this.stats.movementSpeed);
			this.move(newPosition);
		}
	}

	move(newPosition: GridPosition) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}

	tick() {
		this.stats.tick();
		if (!this.pathFinder.isArrived) {
			this.followPath();
		}
		this.tickCast();
	}
}
