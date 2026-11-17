import { Cell } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Tower } from "../tower";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { DrillTowerBlueprint } from "../../blueprint/implementation/drill-tower-blueprint";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";
import { BattleDrillTower } from "../../battle/implementation/battle-drill-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";

export class DrillTower extends Derive(Tower, HTSynergy, RecruitBattleStart) {
	// An L: the tower is the anchor, the shed on its left and the drill rig below it (cell y grows upward)
	override gridShape: GridShape = new GridShape([
		new Cell({ x: 0, y: 0 }),
		new Cell({ x: -1, y: 0 }),
		new Cell({ x: 0, y: -1 }),
	]);
	constructor(
		public cell: Cell,
		public tower: DrillTowerBlueprint = new DrillTowerBlueprint({}),
	) {
		super({
			imageDrawable: tower,
			hitboxHolder: tower,
			descriptor: tower,
			statsHolder: tower,
			tagHolder: tower,
			rarityHolder: tower,
			targeting: tower,
			synergy: tower,
		});
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = this.gridShape.getCenterPosition(this.cell);
		return new BattleDrillTower(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored);
		return new BattleDrillTower(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}
}
