import { TPathShape } from "../../path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";

import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { SlowingPathTile } from "../../recruit/implementation/slowing-tile";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { BoggedDown } from "../../../stats/status/bogged-down";

export class SlowingBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable, TPathShape(PathResources.slowing)) {
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
			unitStepping.addCondition(new BoggedDown({}));
		}
	}
}
