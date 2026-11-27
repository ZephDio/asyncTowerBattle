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
	multiShot = 0;
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

	// Each forest on a star, counted once when the battle starts, gives one more target per cast
	onBattleStart(): void {
		const { patternEffect, patternCondition, multiShotPerForest } = this.recruit.tower;
		const stars = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			patternEffect.getRelativeCells(this.orientation),
		);
		const forests = stars.filter((star) => patternCondition(star)).length;
		this.multiShot = multiShotPerForest * forests;
	}

	private attack(targets: AnyBattleUnit[]) {
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			for (const target of targets) {
				const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.stats.projectileDamage);
				this.hooks.addProjectile(projectile, this);
			}
		}
		this.finishCast(sucess);
	}

	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit) {
		return enemyUnit.isAlive() && this.isInTargetZone(this.hooks.gridHooks.getCell(enemyUnit.position));
	}

	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	// The main target, then one different enemy in the zone for each multi-shot, all for one cast's food
	onCastResolve(): void {
		if (!this.target || !this.doesTargetMatchesRule(this.target)) {
			this.setTarget(this.hooks.searchTarget(this.position, this.doesTargetMatchesRule.bind(this)));
		}
		if (!this.target) return;
		const targets = [this.target];
		for (let shot = 0; shot < this.multiShot; shot++) {
			const extra = this.hooks.searchTarget(
				this.position,
				(enemyUnit) => !targets.includes(enemyUnit) && this.doesTargetMatchesRule(enemyUnit),
			);
			if (!extra) break;
			targets.push(extra);
		}
		this.attack(targets);
	}
}
