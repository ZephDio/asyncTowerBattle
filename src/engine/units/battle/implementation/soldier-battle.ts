import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleCastle } from "../../../castle/battle/battle-castle";
import { ArmyPath, BattlePath } from "../../../path/entity/path";
import { SoldierRecruit } from "../../recruit/implementation/soldier-recruit";
import { UnitAttackIntent, BattleUnit } from "../entity-units-physic";

export class BattleSoldier extends BattleUnit<SoldierRecruit> {
	speed: number;
	maxLife: number;
	actualLife: number;
	attackSpeed: number;
	attackDamage: number;
	constructor(
		entity: SoldierRecruit,
		position: Position,
		path: BattlePath,
		private hooks: BattleArmyHooks,
	) {
		super(entity, position, path);
		this.speed = entity.speed;
		this.maxLife = entity.maxLife;
		this.actualLife = entity.maxLife;
		this.attackSpeed = entity.attackSpeed;
		this.attackDamage = entity.attackDamage;
	}
	canMove() {
		return true;
	}

	isAlive() {
		return this.actualLife > 0;
	}

	attack() {
		if (!this.attackIntent) {
			this.attackIntent = new UnitAttackIntent(this, () => {
				this.target.isAttacked(this.attackDamage);
				this.attackIntent = null;
			});
			return;
		}
		this.attackIntent.tick();
	}

	isAttacked(damage: number) {
		this.actualLife -= damage;
		if (this.actualLife < 0) {
			this.hooks.removeUnit(this);
		}
	}

	tick() {
		if (!this.pathFinder.isArrived) {
			this.followPath();
			return;
		}
		this.attack();
	}
}
