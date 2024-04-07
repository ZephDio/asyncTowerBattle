import { Derive } from "@ddd-ts/traits";
import { GridElement } from "../../../grid/grid";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { HTHitbox, TCollider } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BasicPathTile } from "../../blueprint/implementation/basic-tile";

export class BasicBattlePathTile extends Derive(TCollider, HTHitbox, GridElement, TRenderable, HTImageDrawable) {
	constructor(
		pathTile: BasicPathTile,
		public cell: Cell,
		public position: Position,
		_hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: pathTile, hitboxHolder: pathTile });
	}

	tick() {
		return;
	}
}
