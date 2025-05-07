import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { WitchHouse } from "../../recruit/implementation/witch-house";
import { SlowingBattlePathTile } from "../../../../tile/battle/implementation/slowing-battle-tile";
import { BasicBattlePathTile } from "../../../../tile/battle/implementation/basic-battle-tile";
import { TrapBattlePathTile } from "../../../../tile/battle/implementation/trap-battle-tle";
import { BattleTower } from "../battle-tower";

export class BattleWitchHouse extends Derive(BattleTower) {
	constructor(
		private readonly recruit: WitchHouse,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: number,
	) {
		super({
			orientation,
			recruit,
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			castSpeed: recruit.attackSpeed,
			attackSpeed: NaN,
			onDeath: () => {},
			foodCost: recruit.foodCost,
			hitboxHolder: recruit,
			descriptor: recruit,
		});
		this.gridShape = recruit.gridShape;
		this.setOrientation(orientation);
	}

	private attack() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.recruit.patternEffect.getRelativeCells(this.recruit.orientation),
		);
		let sucess: boolean = false;
		if (
			neighbors.some(
				(neighbor) =>
					neighbor instanceof BasicBattlePathTile ||
					neighbor instanceof SlowingBattlePathTile ||
					neighbor instanceof TrapBattlePathTile,
			)
		) {
			sucess = this.hooks.alliedFoodHooks.consumeFood(this.recruit.foodCost);
			if (sucess) {
				for (const neighbor of neighbors) {
					if (
						neighbor instanceof BasicBattlePathTile ||
						neighbor instanceof SlowingBattlePathTile ||
						neighbor instanceof TrapBattlePathTile
					) {
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
