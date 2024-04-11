import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BasicPathTile } from "../../recruit/implementation/basic-tile";
import { GridElement } from "../../../../shared/traits/grid-element";
import { TRenderable } from "../../../../shared/traits/trenderable";

export class BasicBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable) {
	constructor(
		pathTile: BasicPathTile,
		public cell: Cell,
		public position: GridPosition,
		_hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: pathTile, hitboxHolder: pathTile });
	}

	tick() {
		return;
	}
}
