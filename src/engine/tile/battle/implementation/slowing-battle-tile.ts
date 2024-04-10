import { Derive } from "@ddd-ts/traits";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { Status } from "../../../../shared/traits/status";
import { Stats } from "../../../stats/stats";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { SlowingPathTile } from "../../recruit/implementation/slowing-tile";
import { GridElement } from "../../../../shared/traits/grid-element";

export class SlowingBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable) {
	constructor(
		pathTile: SlowingPathTile,
		public cell: Cell,
		public position: GridPosition,
		private hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: pathTile, hitboxHolder: pathTile });
	}

	tick() {
		const unitsStepping = this.hooks.searchEnemyInArea(this.position, this.hitbox);
		for (const unitStepping of unitsStepping) {
			unitStepping.addStatus(new BoggedDown({}));
		}
	}
}

export class BoggedDown extends Derive(Status) {
	key = "boggedDown";
	clock = 0;
	duration = 3;
	stats: Stats;
	didTrigger = false;
	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.onRemove();
		}

		if (this.didTrigger) return;
		this.stats.basePercentStat.movementSpeed -= 30;
		this.didTrigger = true;
	}

	onRemove() {
		this.stats.basePercentStat.movementSpeed += 30;
		this.stats.removeStatus(this);
	}
}
