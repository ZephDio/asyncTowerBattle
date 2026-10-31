import { TPathShape } from "../../../tile/path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { StunTrap } from "../../recruit/implementation/stun-trap";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Action } from "../../../../shared/action";
import { secondsToFrame } from "../../../../shared/seconds";
import { Stunned } from "../../../stats/status/stunned";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";
import { HTRarity } from "../../../../shared/traits/engine/rarity";

export class BattleStunTrap extends Derive(
	TCollider,
	HTHitbox,
	GridElement,
	TRenderable,
	HTImageDrawable,
	TPathShape(PathResources.trap),
	HTTag,
	HTRarity,
) {
	didTrigger = false;
	cooldown = secondsToFrame(3);
	clock = 0;

	action = null as null | Action;

	constructor(
		trap: StunTrap,
		public cell: Cell,
		public position: GridPosition,
		private hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: trap, hitboxHolder: trap, tagHolder: trap, rarityHolder: trap });
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
