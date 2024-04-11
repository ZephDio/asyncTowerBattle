import { Derive } from "@ddd-ts/traits";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { GridElement } from "../../../../shared/traits/grid-element";
import { TrapPathTile } from "../../recruit/implementation/trap-tile";
import { Status } from "../../../../shared/traits/status";
import { Stats } from "../../../stats/stats";

export class TrapBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable) {
	didTrigger = false;
	cooldown = 100;
	clock = 0;

	constructor(
		pathTile: TrapPathTile,
		public cell: Cell,
		public position: GridPosition,
		private hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: pathTile, hitboxHolder: pathTile });
	}

	tick() {
		if (this.didTrigger) {
			this.clock++;
			if (this.clock >= this.cooldown) {
				this.didTrigger = false;
				this.clock = 0;
			}
			return;
		}
		const unitsStepping = this.hooks.searchEnemyInArea(this.position, this.hitbox);
		if (unitsStepping.length === 0) return;
		for (const unitStepping of unitsStepping) {
			console.log("stepping", unitStepping);
			unitStepping.addStatus(new Stunned({}));
		}
		this.didTrigger = true;
	}
}

export class Stunned extends Derive(Status) {
	key = "stunned";
	clock = 0;
	duration = 20;
	stats: Stats;
	didTrigger = false;
	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.onRemove();
		}

		if (this.didTrigger) return;
		// this.stats.basePercentStat.movementSpeed = 0;
		this.didTrigger = true;
	}

	onRemove() {
		// this.stats.basePercentStat.movementSpeed = 100;
		this.stats.removeStatus(this);
	}
}
