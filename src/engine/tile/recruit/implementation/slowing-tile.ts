import { Derive } from "@ddd-ts/traits";
import { Cell } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { SlowingBattlePathTile } from "../../battle/implementation/slowing-battle-tile";
import { PathTile } from "../tile";
import { TRecruit } from "../../../../shared/traits/recruit";
import { SlowingTileBlueprint } from "../../blueprint/implementation/slowing-tile-blueprint";
import { BattleGrid } from "../../../grid/battle-grid";

export class SlowingPathTile extends Derive(TRecruit, PathTile) {
	constructor(
		public cell: Cell,
		public tile: SlowingTileBlueprint = new SlowingTileBlueprint({}),
	) {
		super({ hitboxHolder: tile, imageDrawable: tile });
	}

	// toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
	// 	return new SlowingBattlePathTile(this, cell, position, hooks);
	// }

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToReal(this.cell.clone());
		return new SlowingBattlePathTile(this, this.cell, position, hooks);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToReal(cell.clone());
		return new SlowingBattlePathTile(this, cell, position, hooks);
	}
}
