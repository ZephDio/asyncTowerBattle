import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeTotem } from "../../recruit/implementation/orange-tower-recruit";
import { HaveStats, Stats } from "../../../stats/stats";
import { Status } from "../../../../shared/traits/engine/status";
import { BattleTotem } from "../battle-totem";

export class OrangeBattleTower extends Derive(BattleTotem) {
	hasTriggered = false;

	constructor(
		public recruit: OrangeTotem,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({ imageDrawable: recruit, hitboxHolder: recruit });
		this.gridShape = recruit.gridShape;
	}

	tick() {
		if (!this.hasTriggered) {
			const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
				this.cell,
				this.recruit.patternEffect.getRelativeCells(this.recruit.orientation),
			);
			for (const neighbor of neighbors) {
				if (implementsTrait(neighbor, HaveStats)) {
					neighbor.addStatus(new OrangeTowerBuff({}));
				}
			}
			this.hasTriggered = true;
		}
	}


}

export class OrangeTowerBuff extends Derive(Status) {
	clock = 0;
	duration: number;

	key = "orange-tower-buff";
	maxDuration = Infinity;
	stats: Stats;

	didTrigger = false;

	tick() {
		this.clock++;
		if (this.didTrigger) return;
		this.stats.basePercentStat.attack += 30;
		this.didTrigger = true;
	}
}
