import { Derive } from "@ddd-ts/traits";
import { ForestCabin } from "../../recruit/implementation/forest-cabin";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";

export class BattleForestCabin extends Derive(BattleTower, BattleStartTrigger) {
	target = null as null | AnyBattleUnit;
	constructor(
		private readonly recruit: ForestCabin,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			orientation,
			recruit,
			casterRecruit: recruit,
			battleStartRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			castleDamage: recruit.stats.castleDamage,
			projectileDamage: recruit.stats.projectileDamage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => {},
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
	}

	// Each forest on a star, counted once when the battle starts, speeds the cast up
	onBattleStart(): void {
		const { patternEffect, patternCondition, castSpeedPercentPerForest } = this.recruit.tower;
		const stars = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			patternEffect.getRelativeCells(this.orientation),
		);
		const forests = stars.filter((star) => patternCondition(star)).length;
		this.stats.basePercentStat.castSpeed += castSpeedPercentPerForest * forests;
	}

	private attack(target: AnyBattleUnit) {
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.stats.projectileDamage);
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

	onCastResolve(): void {
		if (this.target && this.doesTargetMatchesRule(this.target)) {
			this.attack(this.target);
			return;
		}
		const target = this.hooks.searchTarget(this.position, this.doesTargetMatchesRule.bind(this));
		this.setTarget(target);
		if (this.target) this.attack(this.target);
	}
}
