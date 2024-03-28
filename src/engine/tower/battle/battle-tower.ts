import { BattleArmyHooks } from "../../army/battle/battle-army";
import { PhysicEntity } from "../../../shared/physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { TowerRecruit } from "../recruit/tower-recruit";
import { BattleUnit } from "../../units/battle/entity-units-physic";
import { GridPosition, Position } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";
import { AnyTower } from "../entity/tower";

export abstract class BattleTower<TR extends TowerRecruit = TowerRecruit> extends PhysicEntity<TR> {
	attackDamage: number;
	target = null as null | BattleUnit<UnitRecruit<Unit>>;
	attackIntent = null as null | TowerAttackIntent;
	constructor(
		towerEntity: TR,
		position: Position,
		public gridPosition: GridPosition,
		public hooks: BattleArmyHooks,
	) {
		super(towerEntity.clone() as TR, position, 0, towerEntity.type); // :c Elies help
		this.attackDamage = this.entity.attackDamage;
	}
	abstract tick(): void;

	setTarget(enemyUnit: BattleUnit<UnitRecruit<Unit>> | null) {
		this.target = enemyUnit;
	}

	isAlive() {
		return true;
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
