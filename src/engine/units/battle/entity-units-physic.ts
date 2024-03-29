import { Position } from "../../../shared/position";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { BattlePath } from "../../path/entity/path";
import { PathFinder } from "../../battle/path-finder";
import { PhysicEntity } from "../../../shared/physic";
import { Unit } from "../entity/units";
import { UnitRecruit } from "../recruit/unit-recruit";

export abstract class BattleUnit<UE extends UnitRecruit<Unit>> extends PhysicEntity<UE> {
	abstract speed: number;
	abstract actualLife: number;
	abstract maxLife: number;
	pathFinder: PathFinder;
	abstract attackSpeed: number;
	abstract attackDamage: number;
	attackIntent = null as null | UnitAttackIntent;
	target: BattleCastle;
	constructor(entity: UE, position: Position, enemyPath: BattlePath) {
		super(entity, position, 0, entity.type);
		this.pathFinder = new PathFinder(enemyPath.getNodes());
		this.target = enemyPath.alliedCastle;
	}

	abstract canMove(): boolean;

	followPath(): void {
		if (this.canMove() && !this.pathFinder.isArrived) {
			const newPosition = this.pathFinder.getNextPosition(this.position, this.speed);
			this.move(newPosition);
		}
	}

	move(newPosition: Position) {
		this.position.x = newPosition.x;
		this.position.y = newPosition.y;
	}

	toSerialized(): SerializedBattleUnit {
		return {
			type: this.type,
			position: this.position,
		};
	}
}

export type SerializedBattleUnit = {
	type: string;
	position: Position;
};

export class UnitAttackIntent {
	progress = 0;
	constructor(
		public unitEntity: BattleUnit<UnitRecruit<Unit>>,
		public resolveAttack: () => void,
	) {}

	tick() {
		this.progress += this.unitEntity.attackSpeed;
		if (this.progress >= 100) {
			this.resolveAttack();
		}
	}
}
