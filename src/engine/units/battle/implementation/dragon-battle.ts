import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Dragon } from "../../recruit/implementation/dragon-recruit";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";

export class BattleDragon extends Derive(TBattleUnit, Caster) {
	pathFinder: PathFinder;

	constructor(
		recruit: Dragon,
		public position: GridPosition,
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

	attackCastle() {
		this.enemyPath.alliedCastle.takeDamage(this.stats.attack);
		this.castInProgress = null;
	}
	casts(): void {
		this.castInProgress = new Cast(this, this.attackCastle.bind(this), 100);
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
			return;
		}
		this.tickCast();
	}
}
