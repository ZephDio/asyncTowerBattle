import { Cell } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Tower } from "../tower";
import { BattleGrid } from "../../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { MagicLighthouseBlueprint } from "../../blueprint/implementation/magic-lighthouse-blueprint";
import { BattleMagicLighthouse } from "../../battle/implementation/battle-magic-lighthouse";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";

export class MagicLighthouse extends Derive(Tower) {
	// Vertical 1x2: the anchor cell at the bottom and the one above it
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: 0, y: 1 })]);
	constructor(
		public cell: Cell,
		public tower: MagicLighthouseBlueprint = new MagicLighthouseBlueprint({}),
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
		return new BattleMagicLighthouse(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored);
		return new BattleMagicLighthouse(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}
}
