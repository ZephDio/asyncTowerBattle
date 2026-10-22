import { TPathShape } from "../../../tile/path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";

import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { SlowingTrap } from "../../recruit/implementation/slowing-trap";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { BoggedDown } from "../../../stats/status/bogged-down";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";

export class BattleSlowingTrap extends Derive(
	TCollider,
	HTHitbox,
	GridElement,
	TRenderable,
	HTImageDrawable,
	TPathShape(PathResources.slowing),
	HTTag,
) {
	constructor(
		trap: SlowingTrap,
		public cell: Cell,
		public position: GridPosition,
		private hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: trap, hitboxHolder: trap, tagHolder: trap });
	}

	tick() {
		const unitsStepping = this.hooks.searchEnemyInArea(this.position, this.hitbox);
		for (const unitStepping of unitsStepping) {
			unitStepping.addCondition(new BoggedDown({}));
		}
	}
}
