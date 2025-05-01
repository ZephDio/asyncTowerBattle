import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnvilTotem } from "../../recruit/implementation/anvil";
import { HaveStats, Stats } from "../../../stats/stats";
import { Status } from "../../../../shared/traits/engine/status";
import { BattleTotem } from "../battle-totem";
import { BattleStartTrigger } from "../../../../shared/traits/engine/battle-start";
import { HTDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";

export class AnvilBattleTotem extends Derive(BattleTotem, BattleStartTrigger, HTDescriptor) {
	constructor(
		public recruit: AnvilTotem,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({ imageDrawable: recruit, hitboxHolder: recruit, battleStartRecruit: recruit, descriptor: recruit });
		this.gridShape = recruit.gridShape;
	}

	onBattleStart() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.recruit.patternEffect.getRelativeCells(this.recruit.orientation),
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

	didTrigger = false;

	tick() {
		this.clock++;
		if (this.didTrigger) return;
		this.stats.basePercentStat.attack += 30;
		this.didTrigger = true;
	}

	override onRemove(): void {
		this.stats.basePercentStat.attack -= 30;
	}
}
