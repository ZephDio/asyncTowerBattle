import { Derive } from "@ddd-ts/traits";
import { CropsField } from "../../recruit/implementation/crops-field";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { FoodTag } from "../../../../shared/traits/engine/tags";
import { BattleTotem } from "../battle-totem";
import { seconds } from "../../../../shared/seconds";

export class BattleCropsField extends Derive(BattleTotem, Caster, FoodTag) {
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
			maxHealth: NaN,
			attack: NaN,
			attackSpeed: NaN,
			movementSpeed: NaN,
			castSpeed: cropsField.castSpeed,
			foodCost: NaN,
			onDeath: () => {},
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
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), seconds(3.5));
	}
}
