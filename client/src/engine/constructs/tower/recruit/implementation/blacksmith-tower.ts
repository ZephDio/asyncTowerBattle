import { Cell } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Tower } from "../tower";
import { BattleGrid } from "../../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { BlacksmithTowerBlueprint } from "../../blueprint/implementation/blacksmith-tower-blueprint";
import { BattleBlacksmithTower } from "../../battle/implementation/battle-blacksmith-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";

export class BlacksmithTower extends Derive(Tower) {
	// Horizontal 2x1: the anchor cell on the left and the one on its right
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: 1, y: 0 })]);
	constructor(
		public cell: Cell,
		public tower: BlacksmithTowerBlueprint = new BlacksmithTowerBlueprint({}),
	) {
		super({
			imageDrawable: tower,
			hitboxHolder: tower,
			descriptor: tower,
			statsHolder: tower,
			tagHolder: tower,
			rarityHolder: tower,
			targeting: tower,
		});
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = this.gridShape.getCenterPosition(this.cell);
		return new BattleBlacksmithTower(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored);
		return new BattleBlacksmithTower(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}
}
