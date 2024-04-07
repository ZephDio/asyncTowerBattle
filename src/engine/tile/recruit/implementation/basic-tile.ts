import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../../../shared/position";
import { BasicBattlePathTile } from "../../battle/implementation/basic-battle-tile";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathTile } from "../tile";
import { BasicTileBlueprint } from "../../blueprint/implementation/basic-path-blueprint";

export class BasicPathTile extends Derive(PathTile) {
	constructor(
		public cell: Cell,
		public tile: BasicTileBlueprint = new BasicTileBlueprint({}),
	) {
		super({ hitboxHolder: tile, imageDrawable: tile });
	}

	toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
		return new BasicBattlePathTile(this, cell, position, hooks);
	}
}
