import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { WitchHouse } from "../../recruit/implementation/witch-house";
import { BasicBattlePathTile } from "../../../../tile/battle/implementation/basic-battle-tile";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

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
		this.gridShape = recruit.gridShape;
	}

	private attack() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.recruit.patternEffect.getRelativeCells(this.orientation),
		);
		let sucess: boolean = false;
		if (neighbors.some((neighbor) => neighbor instanceof BasicBattlePathTile)) {
			sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
			if (sucess) {
				for (const neighbor of neighbors) {
					if (neighbor instanceof BasicBattlePathTile) {
						const position = this.hooks.gridHooks.getRealPosition(neighbor.cell);
						const areaEffects = this.recruit.getAreaEffect(this.hooks, position, this.stats.attack);
						this.hooks.addAreaEffect(areaEffects, this);
					}
				}
			}
		}
		this.finishCast(sucess);
	}
	onCastResolve(): void {
		this.attack();
		this.finishCast();
	}
}
