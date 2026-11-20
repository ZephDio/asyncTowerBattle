import type { AnyBattleUnit } from "../../units/battle/battle-unit";
import type { FlatStat } from "../../stats/stats";
import type { BattleArmyHooks } from "./battle-army";

// A flat bonus a monument gives for good to the allied units it picks: every picked unit that joins the army gets
// the amount reached so far, and raising it gives the increase to the picked units already there.
// It picks the units `appliesTo` matches (null matches none), plus the ones handed to `target`.
export class PermanentBuff {
	private readonly targets = new WeakSet<AnyBattleUnit>();

	constructor(
		private readonly hooks: Pick<BattleArmyHooks, "getAlliedUnits" | "onUnitAdded">,
		private readonly appliesTo: ((unit: AnyBattleUnit) => boolean) | null,
		private readonly stat: FlatStat,
		public amount = 0,
	) {
		hooks.onUnitAdded((unit) => {
			if (this.picks(unit)) this.giveTo(unit, this.amount);
		});
	}

	// Picks one given unit, e.g. a unit a barrack summons. A unit not in the army yet gets the buff when it joins.
	target(unit: AnyBattleUnit) {
		if (this.picks(unit)) return;
		this.targets.add(unit);
		if (this.hooks.getAlliedUnits().includes(unit)) this.giveTo(unit, this.amount);
	}

	raise(delta: number) {
		this.amount += delta;
		for (const unit of this.hooks.getAlliedUnits()) {
			if (this.picks(unit)) this.giveTo(unit, delta);
		}
	}

	private picks(unit: AnyBattleUnit) {
		return this.targets.has(unit) || (this.appliesTo?.(unit) ?? false);
	}

	private giveTo(unit: AnyBattleUnit, amount: number) {
		if (amount === 0) return;
		unit.stats.addFlat(this.stat, amount);
	}
}
