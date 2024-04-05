import { Derive } from "@ddd-ts/traits";
import { TImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { Cell, Position } from "../../../../shared/position";
import { HitBox, Rectangle } from "../../../../shared/hitboxes";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { SlowingBattlePathTile } from "../../battle/implementation/slowing-battle-tile";
import { PathTile } from "../tile";

export class SlowingPathTile extends Derive(
	PathTile,
	TRenderable,
	TImageDrawable(Resources.path.slowing.image, { width: 4.9, height: 4.9 }, 2),
) {
	public hitbox = new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]]);

	constructor(public cell: Cell) {
		super({});
	}

	toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
		return new SlowingBattlePathTile(this, cell, position, hooks);
	}
}
