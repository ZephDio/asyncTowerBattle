import { Derive, implementsTrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Windmill } from "../../recruit/implementation/windmill";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { Caster } from "../../../../../shared/traits/engine/cast";
import { Stats } from "../../../../stats/stats";
import { Status } from "../../../../../shared/traits/engine/status";
import { BattleTotem } from "../battle-totem";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { FoodTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class BattleWindmill extends Derive(BattleTotem, HTSynergy, FoodTag, BattleStartTrigger) {
	foodProduction: number = 5;
	constructor(
		public windmill: Windmill,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({
			battleStartRecruit: windmill,
			imageDrawable: windmill,
			hitboxHolder: windmill,
			synergy: windmill,
			descriptor: windmill,
		});
		this.gridShape = windmill.gridShape;
	}

	onBattleStart(): void {
		const elements = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.patternEffect.getRelativeCells(this.orientation),
		);
		for (const element of elements) {
			if (!element) continue;
			if (implementsTrait(element, FoodTag)) {
				this.hooks.alliedFoodHooks.addMaxFood(5);
				if (implementsTrait(element, Caster)) {
					const windmillBuff = new WindmillBuff({});
					element.addBoon(windmillBuff);
				}
			}
		}
	}
	tick() {}
}

export class WindmillBuff extends Derive(Status) {
	clock = 0;
	stats: Stats;
	override key = "windmill-buff";
	override duration = Infinity;
	hasTriggered = false;
	override tick(): void {
		if (this.hasTriggered) return;
		this.hasTriggered = true;
		this.stats.basePercentStat.castSpeed += 0.25;
	}
	override onRemove(): void {
		this.stats.basePercentStat.castSpeed -= 0.25;
	}
}
