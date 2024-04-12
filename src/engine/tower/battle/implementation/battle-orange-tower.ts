import { Derive, implementsTrait } from "@ddd-ts/traits";
import { TPhysics } from "../../../../shared/traits/engine/core/physics";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeTower } from "../../recruit/implementation/orange-tower-recruit";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { HaveStats, Stats } from "../../../stats/stats";
import { Status } from "../../../../shared/traits/engine/status";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";

export class OrangeBattleTower extends Derive(HTHitbox, TPhysics, HTImageDrawable, TRenderable, GridElement) {
	hasTriggered = false;

	constructor(
		recruit: OrangeTower,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
	) {
		super({ imageDrawable: recruit, hitboxHolder: recruit });
	}

	get realPosition(): GridPosition {
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
