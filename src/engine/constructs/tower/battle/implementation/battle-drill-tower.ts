import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { Drill } from "../../../../projectile/blueprint/implementation/drill";
import { BattleDrill } from "../../../../projectile/battle/implementation/battle-drill";
import { DrillTower } from "../../recruit/implementation/drill-tower";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";

export class BattleDrillTower extends Derive(BattleTower, BattleStartTrigger) {
	constructor(
		private readonly recruit: DrillTower,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			battleStartRecruit: recruit,
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
			rarityHolder: recruit,
		});
		this.gridShape = recruit.gridShape;
	}

	onBattleStart(): void {
		const [star] = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.recruit.patternEffect.getRelativeCells(this.orientation),
		);
		if (!this.recruit.patternEffect.patternCondition(star)) return;
		this.stats.basePercentStat.castSpeed += this.recruit.tower.rockCastSpeedPercent;
	}

	// Shoots from the drill cell, under the tower, straight toward the bottom of its own board
	private shootDrill() {
		const { below } = this.hooks.gridHooks.getRelativeDirection();
		const anchor = this.hooks.gridHooks.getRealPosition(this.cell);
		const start = new GridPosition({
			x: anchor.x + below.x * STANDARD_CELL_SIZE,
			y: anchor.y + below.y * STANDARD_CELL_SIZE,
		});
		this.hooks.addProjectile(new BattleDrill(new Drill(), start, this.hooks, this.stats.attack, below), this);
	}

	private isEnemyInTargetZone(enemyUnit: AnyBattleUnit) {
		return enemyUnit.isAlive() && this.isInTargetZone(this.hooks.gridHooks.getCell(enemyUnit.position));
	}

	// Waits, with the cast ready, until an enemy walks into the column under the drill
	onCastResolve(): void {
		if (!this.hooks.searchTarget(this.position, this.isEnemyInTargetZone.bind(this))) return;
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) this.shootDrill();
		this.finishCast(sucess);
	}
}
