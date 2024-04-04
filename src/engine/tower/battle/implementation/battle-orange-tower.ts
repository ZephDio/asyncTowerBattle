import { Derive, implementsTrait } from "@ddd-ts/traits";
import { TPhysics } from "../../../../shared/traits/physics";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { GridElement } from "../../../grid/grid";
import { HaveStats, Stats } from "../../../stats/stats";
import { Status } from "../../../../shared/traits/status";

export class OrangeBattleTower extends Derive(TPhysics, HTImageDrawable, TRenderable, GridElement) {
	hasTriggered = false;

	constructor(
		recruit: OrangeTowerRecruit,
		readonly hooks: BattleArmyHooks,
		public readonly position: Position,
		public readonly cell: Cell,
	) {
		super({ imageDrawable: recruit });
	}

	get realPosition(): Position {
		return this.position;
	}

	tick() {
		if (!this.hasTriggered) {
			const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(this.cell, [
				new Cell({ x: 0, y: 1 }),
				new Cell({ x: 0, y: -1 }),
			]);
			for (const neighbor of neighbors) {
				if (implementsTrait(neighbor, HaveStats)) {
					neighbor.addStatus(new OrangeTowerBuff({}));
				}
			}
			this.hasTriggered = true;
		}
	}

	isAlive(): boolean {
		return true;
	}

	takeDamage(_damage: number): void {
		return;
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
