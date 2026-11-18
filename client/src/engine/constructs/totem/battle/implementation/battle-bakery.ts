import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { CasterTotem } from "../battle-totem";
import { Bakery } from "../../recruit/implementation/backery";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattleBakery extends Derive(CasterTotem, TStatsRenderable) {
	vitalityBuffAmount: number = 2;
	constructor(
		public bakery: Bakery,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			casterRecruit: bakery,
			tagHolder: bakery,
			rarityHolder: bakery,
			imageDrawable: bakery,
			hitboxHolder: bakery,
			maxHealth: bakery.stats.health,
			attack: bakery.stats.damage,
			attackSpeed: bakery.stats.attackSpeed,
			movementSpeed: bakery.stats.speed,
			castSpeed: bakery.stats.castSpeed,
			foodCost: bakery.stats.foodConsumptionOnCast,
			range: bakery.stats.range,
			onDeath: () => {},
			descriptor: bakery,
		});
		this.gridShape = bakery.gridShape;
	}

	feedTheArmy() {
		const success = this.hooks.alliedFoodHooks.consumeFood(5);
		if (!success) {
			this.produceBreads();
			this.finishCast();
			return;
		}
		this.hooks.alliedArmyBuffHooks.addUnitBuff("vitality", this.vitalityBuffAmount);
		this.finishCast();
	}

	produceBreads() {
		this.hooks.alliedFoodHooks.addFood(3);
	}

	casts() {
		this.castInProgress = new Cast(this, this.feedTheArmy.bind(this));
	}

	tick() {
		this.stats.tick();
		this.tickCast();
	}
}
