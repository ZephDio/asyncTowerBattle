import { Trait } from "@ddd-ts/traits";
import { BasicPathTile } from "./implementation/basic-tile";
import { SlowingPathTile } from "./implementation/slowing-tile";
import { Cell, Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyBattleTile } from "../battle/battle-tile";

export const PathTile = Trait((base) => {
	abstract class IPathTile extends base {
		abstract cell: Cell;

		get position() {
			return this.cell;
		}

		abstract toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks): AnyBattleTile;
	}
	return IPathTile;
});

export type AnyPathTile = BasicPathTile | SlowingPathTile;
