import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { WitchHouse } from "../../recruit/implementation/witch-house";
import { BasicBattlePathTile } from "../../../../tile/battle/implementation/basic-battle-tile";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";

export class BattleWitchHouse extends Derive(BattleTower) {
	constructor(
		private readonly recruit: WitchHouse,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			orientation,
			recruit,
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			castleDamage: recruit.stats.castleDamage,
			projectileDamage: recruit.stats.projectileDamage,
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

	private attack() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.targetZone.getRelativeCells(this.orientation),
		);
		let sucess: boolean = false;
		if (neighbors.some((neighbor) => neighbor instanceof BasicBattlePathTile)) {
			sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
			if (sucess) {
				for (const neighbor of neighbors) {
					if (neighbor instanceof BasicBattlePathTile) {
						const position = this.hooks.gridHooks.getRealPosition(neighbor.cell);
						const areaEffects = this.recruit.getAreaEffect(this.hooks, position, this.stats.projectileDamage);
						this.hooks.addAreaEffect(areaEffects, this);
					}
				}
			}
		}
		this.finishCast(sucess);
	}

	private isEnemyInTargetZone(enemyUnit: AnyBattleUnit) {
		return enemyUnit.isAlive() && this.isInTargetZone(this.hooks.gridHooks.getCell(enemyUnit.position));
	}

	// Waits, with the cast ready, until an enemy walks into the target zone
	onCastResolve(): void {
		if (!this.hooks.searchTarget(this.position, this.isEnemyInTargetZone.bind(this))) return;
		this.attack();
	}
}
