import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../../shared/physic";
import { BlueTower } from "../../recruit/implementation/blue-tower";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { BattleTower } from "../battle-tower";
export class BlueBattleTower extends Derive(BattleTower) {
	constructor(
		private readonly recruit: BlueTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: number,
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			hitboxHolder: recruit,
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			castSpeed: recruit.attackSpeed,
			attackSpeed: NaN,
			foodCost: recruit.foodCost,
			onDeath: () => {},
			descriptor: recruit,
		});
	}

	target = null as null | AnyBattleUnit;
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

	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	onCastResolve() {
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
}
