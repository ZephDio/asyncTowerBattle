import { Cell } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { BattleGrid } from "../../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { Totem } from "../totem";
import { RedObeliskBlueprint } from "../../blueprint/implementation/red-obelisk";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";
import { RecruitCaster } from "../../../../../shared/traits/engine/cast";
import { BattleRedObelisk } from "../../battle/implementation/battle-red-obelisk";
import { HTBaseStats } from "../../../../stats/base-stats";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class RedObelisk extends Derive(Totem, HTSynergy, RecruitCaster, HTBaseStats) {
	castSpeed: number;
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: 0, y: 1 })]);
	constructor(
		public cell: Cell,
		public bluePrint: RedObeliskBlueprint = new RedObeliskBlueprint({}),
	) {
		super({
			synergy: bluePrint,
			tagHolder: bluePrint,
			imageDrawable: bluePrint,
			hitboxHolder: bluePrint,
			descriptor: bluePrint,
			statsHolder: bluePrint,
		});
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = this.gridShape.getCenterPosition(this.cell);
		return new BattleRedObelisk(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored);
		return new BattleRedObelisk(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}
}
