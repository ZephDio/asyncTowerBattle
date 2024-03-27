import { BattleArmyHooks } from "../../army/battle/battle-army";
import { Physic, PhysicEntity } from "../../../shared/physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { TowerRecruit } from "../recruit/tower-recruit";
import { BattleUnit } from "../../units/battle/entity-units-physic";
import { GridPosition, Position } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";
import { AnyTower } from "../entity/tower";

export abstract class BattleTower extends PhysicEntity<TowerRecruit> {
	attackDamage: number;
	target = null as null | BattleUnit<UnitRecruit<Unit>>;
	attackIntent = null as null | TowerAttackIntent;
	constructor(
		towerEntity: TowerRecruit,
		position: Position,
		public gridPosition: GridPosition,
		public hooks: BattleArmyHooks,
	) {
		super(towerEntity.clone(), position, 0, towerEntity.type);
		this.attackDamage = this.entity.attackDamage;
	}

	setTarget(enemyUnit: BattleUnit<UnitRecruit<Unit>> | null) {
		this.target = enemyUnit;
	}

	isAlive() {
		return true;
	}

	tick() {
		if (this.attackIntent) {
			this.attackIntent.tick();
		}
		if (!this.attackIntent) {
			this.attackIntent = new TowerAttackIntent(this, () => {
				if (
					this.target &&
					this.entity.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))
				) {
					this.attack(this.target);
					return;
				}
				const target = this.hooks.searchTarget(this);
				this.setTarget(target);
				if (this.target) {
					this.attack(this.target);
					return;
				}
			});
		}
	}

	attack(target: BattleUnit<UnitRecruit<Unit>>) {
		const projectile = this.entity.getProjectile(this.hooks, target, this.position, this.attackDamage);
		this.hooks.addProjectile(projectile, this);
		this.attackIntent = null;
	}

	toSerialized(grid: BattleGrid) {
		return {
			type: this.entity.type,
			gridPosition: this.gridPosition,
			position: grid.gridPositionToReal(this.gridPosition),
		};
	}
}

export type SerializedBattleTower = {
	type: AnyTower["type"];
	gridPosition: GridPosition;
	position: Position;
};

export class TowerAttackIntent {
	progress = 0;
	constructor(
		public towerRecruit: BattleTower,
		public resolveAttack: () => void,
	) {}

	tick() {
		this.progress += this.towerRecruit.entity.attackSpeed;
		if (this.progress >= 100) {
			this.resolveAttack();
		}
	}
}
