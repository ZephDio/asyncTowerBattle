import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { FoodTag } from "../../../../shared/traits/engine/tags";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleTotem } from "../battle-totem";
import { seconds } from "../../../../shared/seconds";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
import { Brewery } from "../../recruit/implementation/brewery";

export class BattleBrewery extends Derive(BattleTotem, FoodTag, HTSynergy, Caster) {
	vitalityBuffAmount: number = 2;
	hasTriggered: boolean = false;
	constructor(
		public bakery: Brewery,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({
			synergy: bakery,
			casterRecruit: bakery,
			imageDrawable: bakery,
			hitboxHolder: bakery,
			maxHealth: NaN,
			attack: NaN,
			attackSpeed: NaN,
			movementSpeed: NaN,
			castSpeed: bakery.castSpeed,
			foodCost: NaN,
			onDeath: () => {},
		});
		this.gridShape = bakery.gridShape;
	}

	get realPosition(): GridPosition {
		return this.position;
	}

	gainSpeedForEachBarracks() {
		this.hasTriggered = true;
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.patternEffect.getRelativeCells(this.orientation),
		);
		for (const neighbor of neighbors) {
			if (this.patternEffect.patternCondition(neighbor)) {
				this.hooks.alliedArmyBuffHooks.addUnitBuff("movement-speed");
			}
		}
	}
	produceBrew() {
		const unitAmount = this.hooks.getAlliedUnits().length;
		const production = Math.min(unitAmount * 0.5, 8);
		this.hooks.alliedFoodHooks.addFood(production);
		if (production >= 8) this.hooks.alliedArmyBuffHooks.addUnitBuff("movement-speed");
		this.finishCast();
	}

	casts() {
		this.castInProgress = new Cast(this, this.produceBrew.bind(this), seconds(5));
	}

	tick() {
		if (!this.hasTriggered) this.gainSpeedForEachBarracks();
		this.stats.tick();
		this.tickCast();
	}
}
