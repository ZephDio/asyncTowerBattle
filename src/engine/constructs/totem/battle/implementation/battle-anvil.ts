import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { AnvilTotem } from "../../recruit/implementation/anvil";
import { HaveStats, Stats } from "../../../../stats/stats";
import { Status } from "../../../../../shared/traits/engine/status";
import { BattleTotem } from "../battle-totem";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class AnvilBattleTotem extends Derive(BattleTotem, BattleStartTrigger) {
	constructor(
		public recruit: AnvilTotem,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			imageDrawable: recruit,
			hitboxHolder: recruit,
			tagHolder: recruit,
			battleStartRecruit: recruit,
			descriptor: recruit,
		});
		this.gridShape = recruit.gridShape;
	}

	onBattleStart() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.recruit.patternEffect.getRelativeCells(this.orientation),
		);
		for (const neighbor of neighbors) {
			if (!neighbor) continue;
			if (implementsTrait(neighbor, HaveStats)) {
				neighbor.addBoon(new OrangeTotemBuff({}));
			}
		}
	}
	tick() {}
}

export class OrangeTotemBuff extends Derive(Status) {
	clock = 0;
	duration: number;

	key = "orange-tower-buff";
	maxDuration = Infinity;
	stats: Stats;

	stackCount = 1;
	stackApplied = 0;

	tick() {
		this.clock++;
		if (this.stackApplied >= this.stackCount) return;
		this.stats.basePercentStat.attack += 30;
		this.stackApplied++;
	}

	stack(_status: OrangeTotemBuff): void {
		this.stackCount++;
	}

	override onRemove(): void {
		this.stats.basePercentStat.attack -= 30 * this.stackCount;
	}
}
