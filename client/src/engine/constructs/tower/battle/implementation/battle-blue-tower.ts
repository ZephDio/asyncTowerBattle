import { Derive } from "@ddd-ts/traits";
import { BlueTower } from "../../recruit/implementation/blue-tower";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
export class BlueBattleTower extends Derive(BattleTower) {
	constructor(
		private readonly recruit: BlueTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			hitboxHolder: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => {},
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
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

	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit) {
		return enemyUnit.isAlive() && this.isInTargetZone(this.hooks.gridHooks.getCell(enemyUnit.position));
	}

	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	onCastResolve() {
		if (this.target && this.doesTargetMatchesRule(this.target)) {
			this.attack(this.target);

			return;
		}
		const target = this.hooks.searchTarget(this.position, this.doesTargetMatchesRule.bind(this));
		this.setTarget(target);
		if (this.target) {
			this.attack(this.target);
			return;
		}
	}
}
