import { TPathShape } from "../../path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BasicPathTile } from "../../recruit/implementation/basic-tile";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";

export class BasicBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable, TPathShape(PathResources.normal)) {
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
