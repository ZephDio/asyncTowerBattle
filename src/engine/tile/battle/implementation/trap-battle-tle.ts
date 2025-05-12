import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { TrapPathTile } from "../../recruit/implementation/trap-tile";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Action } from "../../../../shared/action";
import { secondsToFrame } from "../../../../shared/seconds";
import { Stunned } from "../../../stats/status/stunned";

export class TrapBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable) {
	didTrigger = false;
	cooldown = secondsToFrame(3);
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