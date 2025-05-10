import { Derive } from "@ddd-ts/traits";
import { CropsField } from "../../recruit/implementation/crops-field";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Cast, Caster } from "../../../../../shared/traits/engine/cast";
import { BattleTotem } from "../battle-totem";
import { FoodTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";

export class BattleCropsField extends Derive(BattleTotem, Caster, TStatsRenderable, FoodTag) {
	foodProduction: number = 5;
	constructor(
		public cropsField: CropsField,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({
			imageDrawable: cropsField,
			hitboxHolder: cropsField,
			casterRecruit: cropsField,
			maxHealth: cropsField.stats.health,
			attack: cropsField.stats.damage,
			attackSpeed: cropsField.stats.attackSpeed,
			movementSpeed: cropsField.stats.speed,
			castSpeed: cropsField.stats.castSpeed,
			foodCost: cropsField.stats.foodConsumptionOnCast,
			range: cropsField.stats.range,
			onDeath: () => {},
			descriptor: cropsField,
		});
		this.gridShape = cropsField.gridShape;
	}

	tick() {
		this.tickCast();
	}

	onCastResolve() {
		this.produceFood();
		this.finishCast();
	}

	produceFood() {
		this.hooks.alliedFoodHooks.addFood(this.foodProduction);
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
	}
}
