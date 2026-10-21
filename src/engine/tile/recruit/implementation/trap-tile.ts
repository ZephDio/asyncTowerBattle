import { TPathShape } from "../../path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathTile } from "../tile";
import { BattleGrid } from "../../../grid/battle-grid";
import { TrapTileBlueprint } from "../../blueprint/implementation/trap-tile-blueprint";
import { TrapBattlePathTile } from "../../battle/implementation/trap-battle-tle";

export class TrapPathTile extends Derive(PathTile, TPathShape(PathResources.trap)) {
	constructor(
		public cell: Cell,
		public tile: TrapTileBlueprint = new TrapTileBlueprint({}),
	) {
		super({ hitboxHolder: tile, imageDrawable: tile, descriptor: tile });
	}

	toBattle(cell: Cell, position: GridPosition, hooks: BattleArmyHooks) {
		return new TrapBattlePathTile(this, cell, position, hooks);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new TrapBattlePathTile(this, this.cell, position, hooks);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new TrapBattlePathTile(this, cell, position, hooks);
	}
}
