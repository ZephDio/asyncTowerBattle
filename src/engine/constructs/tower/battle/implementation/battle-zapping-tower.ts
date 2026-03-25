import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { ZappingTower } from "../../recruit/implementation/zapping-tower";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { Physic } from "../../../../../shared/physic";
import { BattleTower } from "../battle-tower";

export class ZappingBattleTower extends Derive(BattleTower) {
	target = null as null | AnyBattleUnit;

	constructor(
		private readonly recruit: ZappingTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: number,
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => {},
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
		});

		this.setOrientation(orientation);
		this.gridShape = recruit.gridShape;
	}

	private attack(target: AnyBattleUnit) {
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.stats.attack);
			this.hooks.addProjectile(projectile, this);
		}
		this.finishCast(sucess);
	}

	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
	}

	onCastResolve(): void {
		if (
			this.target &&
			this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))
		) {
			this.attack(this.target);
			return;
		}
		const target = this.hooks.searchTarget(this.position, this.doesTargetMatchesRule);
		this.setTarget(target);
		if (this.target) {
			this.attack(this.target);
			return;
		}
	}

	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}
}
