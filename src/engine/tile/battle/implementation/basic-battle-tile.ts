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
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";
import { HTRarity } from "../../../../shared/traits/engine/rarity";
import { TTrapHolder } from "../../../../shared/traits/engine/trap-holder";
import { AnyBattleTrap } from "../../../trap/battle/battle-trap";

export class BasicBattlePathTile extends Derive(
	TCollider,
	HTHitbox,
	GridElement,
	TRenderable,
	HTImageDrawable,
	TPathShape(PathResources.normal),
	TTrapHolder,
	HTTag,
	HTRarity,
) {
	trap: AnyBattleTrap | null;

	constructor(
		pathTile: BasicPathTile,
		public cell: Cell,
		public position: GridPosition,
		hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: pathTile, hitboxHolder: pathTile, tagHolder: pathTile, rarityHolder: pathTile });
		this.trap = pathTile.trap?.toBattle(cell, position, hooks) ?? null;
	}

	setPathConnections(connections: Cell[]) {
		this.pathConnections = connections;
		if (this.trap) this.trap.pathConnections = connections;
	}

	tick() {
		this.trap?.tick();
	}
}
