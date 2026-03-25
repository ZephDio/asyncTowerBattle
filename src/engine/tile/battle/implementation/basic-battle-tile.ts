import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BasicPathTile } from "../../recruit/implementation/basic-tile";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";

export class BasicBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable, HTTag) {
	constructor(
		pathTile: BasicPathTile,
		public cell: Cell,
		public position: GridPosition,
		_hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: pathTile, hitboxHolder: pathTile, tagHolder: pathTile });
	}

	tick() {
		return;
	}
}
