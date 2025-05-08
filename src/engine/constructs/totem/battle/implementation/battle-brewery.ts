import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Cast, Caster } from "../../../../../shared/traits/engine/cast";
import { BattleTotem } from "../battle-totem";
import { seconds } from "../../../../../shared/seconds";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { Brewery } from "../../recruit/implementation/brewery";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { FoodTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TStatsRenderable } from "../../../../../shared/traits/render/huds/stat-renderable";
export class BattleBrewery extends Derive(
	BattleTotem,
	FoodTag,
	HTSynergy,
	Caster,
	BattleStartTrigger,
	TStatsRenderable,
) {
	vitalityBuffAmount: number = 2;
	constructor(
		public brewery: Brewery,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({
			synergy: brewery,
			casterRecruit: brewery,
			battleStartRecruit: brewery,
			imageDrawable: brewery,
			hitboxHolder: brewery,
			maxHealth: brewery.stats.health,
			attack: brewery.stats.damage,
			attackSpeed: brewery.stats.attackSpeed,
			movementSpeed: brewery.stats.speed,
			castSpeed: brewery.stats.castSpeed,
			foodCost: brewery.stats.foodConsumptionOnCast,
			range: brewery.stats.range,
			onDeath: () => {},
			descriptor: brewery,
		});
		this.gridShape = brewery.gridShape;
	}

	gainSpeedForEachBarracks() {
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

	onBattleStart(): void {
		this.gainSpeedForEachBarracks();
	}

	tick() {
		this.stats.tick();
		this.tickCast();
	}
}
