import type { AnyBattleUnit } from "../../units/battle/battle-unit";
import type { FlatStat } from "../../stats/stats";
import type { BattleArmyHooks } from "./battle-army";

// A flat bonus a monument gives for good to the allied units it picks: every matching unit that joins the army gets
// the amount reached so far, and raising it gives the increase to the matching units already there.
export class PermanentBuff {
	constructor(
		private readonly hooks: Pick<BattleArmyHooks, "getAlliedUnits" | "onUnitAdded">,
		private readonly appliesTo: (unit: AnyBattleUnit) => boolean,
		private readonly stat: FlatStat,
		public amount = 0,
	) {
		hooks.onUnitAdded((unit) => this.giveTo(unit, this.amount));
	}

	raise(delta: number) {
		this.amount += delta;
		for (const unit of this.hooks.getAlliedUnits()) this.giveTo(unit, delta);
	}

	private giveTo(unit: AnyBattleUnit, amount: number) {
		if (amount === 0) return;
		if (!this.appliesTo(unit)) return;
		unit.stats.addFlat(this.stat, amount);
	}
}
