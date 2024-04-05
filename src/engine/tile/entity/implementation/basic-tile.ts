import { Derive } from "@ddd-ts/traits";
import { GridElement } from "../../../grid/grid";
import { TImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { HitBox, Rectangle } from "../../../../shared/hitboxes";
import { Resources } from "../../../../renderer/resources";
import { Cell, Position } from "../../../../shared/position";
import { BasicBattlePathTile } from "../../battle/implementation/basic-battle-tile";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathTile } from "../tile";

export class BasicPathTile extends Derive(
	PathTile,
	GridElement,
	TRenderable,
	TImageDrawable(Resources.path.normal.image, { width: 4.9, height: 4.9 }, 2),
) {
	public hitbox = new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]]);
	constructor(public cell: Cell) {
		super({});
	}

	toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
		return new BasicBattlePathTile(this, cell, position, hooks);
	}
}
