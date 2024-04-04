import { Derive } from "@ddd-ts/traits";
import { GridElement } from "../../../grid/grid";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { HitBox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BasicPathTile } from "../../entity/implementation/basic-tile";

export class BasicBattlePathTile extends Derive(GridElement, TRenderable, HTImageDrawable) {
	public hitbox: HitBox;

	constructor(
		pathTile: BasicPathTile,
		public cell: Cell,
		public position: Position,
		_hooks: BattleArmyHooks,
	) {
		super({ imageDrawable: pathTile });
		this.hitbox = pathTile.hitbox;
	}

	tick() {
		return;
	}
}
