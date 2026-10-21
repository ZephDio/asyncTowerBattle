import { TPathShape } from "../../path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { Cell } from "../../../../shared/position";
import { BasicBattlePathTile } from "../../battle/implementation/basic-battle-tile";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PathTile } from "../tile";
import { BasicTileBlueprint } from "../../blueprint/implementation/basic-path-blueprint";
import { BattleGrid } from "../../../grid/battle-grid";

export class BasicPathTile extends Derive(PathTile, TPathShape(PathResources.normal)) {
	constructor(
		public cell: Cell,
		public tile: BasicTileBlueprint = new BasicTileBlueprint({}),
	) {
		super({ hitboxHolder: tile, imageDrawable: tile, descriptor: tile });
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = grid.cellToGrid(this.cell);
		return new BasicBattlePathTile(this, this.cell, position, hooks);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BasicBattlePathTile(this, cell, position, hooks);
	}
}
