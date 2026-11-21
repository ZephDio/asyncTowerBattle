import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { CasterTotem } from "../battle-totem";
import { Bakery } from "../../recruit/implementation/backery";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";
import { DescriptionLine } from "../../../../../shared/traits/render/huds/item-descriptor";
import { BakeryDescription } from "../../blueprint/implementation/bakery-blueprint";
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
			castleDamage: bakery.stats.castleDamage,
			projectileDamage: bakery.stats.projectileDamage,
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

	// Until the army hits a famine the Bakery feeds it. From then on, to the end of the battle, it produces bread
	// instead. The cast whose own payment triggers the first famine is already replaced (the famine happens anyway).
	feedTheArmy() {
		const food = this.hooks.alliedFoodHooks;
		if (food.hasHitFamine() || !food.consumeFood(5)) {
			this.produceBreads();
			this.finishCast();
			return;
		}
		this.hooks.alliedArmyBuffHooks.addUnitBuff("vitality", this.vitalityBuffAmount);
		this.finishCast();
	}

	// The description follows the battle: after the army's first famine it only lists the effect now played.
	override liveDescription(): DescriptionLine[] {
		if (!(this.description instanceof BakeryDescription)) return this.description.description;
		return this.description.liveDescriptionAt(this.castSpeed, this.hooks.alliedFoodHooks.hasHitFamine());
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
