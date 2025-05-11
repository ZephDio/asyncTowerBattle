import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { TrapPathTile } from "../../recruit/implementation/trap-tile";
import { Stats } from "../../../stats/stats";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Status } from "../../../../shared/traits/engine/status";
import { Action } from "../../../../shared/action";

export class TrapBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable) {
	didTrigger = false;
	cooldown = 96;
	clock = 0;

	action = null as null | Action;

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
		if (!(unitsStepping.length > 0)) return;
		if (this.action === null) {
			this.action = new Action(10, () => {
				this.trapUnits();
				this.action = null;
			});
			return;
		}
		this.action.tick();
	}

	trapUnits() {
		const unitsStepping = this.hooks.searchEnemyInArea(this.position, this.hitbox);
		for (const unitStepping of unitsStepping) {
			unitStepping.addCondition(new Stunned({}));
		}
		this.didTrigger = true;
	}
}

export class Stunned extends Derive(Status) {
	key = "stunned";
	clock = 0;
	duration = 32;
	stats: Stats;
	didTrigger = false;
	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.onRemove();
		}

		if (this.didTrigger) return;
		this.didTrigger = true;
	}

	stack(status: Stunned) {
		this.duration += status.duration;
	}

	onRemove() {}
}
