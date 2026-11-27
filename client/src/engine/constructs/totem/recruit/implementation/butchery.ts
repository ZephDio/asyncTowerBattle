import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { Cell } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { BattleGrid } from "../../../../grid/battle-grid";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";
import { RecruitCaster } from "../../../../../shared/traits/engine/cast";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { HTBaseStats } from "../../../../stats/base-stats";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { ButcheryBlueprint } from "../../blueprint/implementation/butchery-blueprint";
import { BattleButchery } from "../../battle/implementation/battle-butchery";

export class Butchery extends Derive(Totem, HTSynergy, RecruitCaster, HTBaseStats, RecruitBattleStart) {
	override gridShape: GridShape = new GridShape([
		new Cell({ x: 0, y: 0 }),
		new Cell({ x: 0, y: 1 }),
		new Cell({ x: 1, y: 1 }),
	]);
	constructor(
		public cell: Cell,
		public blueprint: ButcheryBlueprint = new ButcheryBlueprint({}),
	) {
		super({
			synergy: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			statsHolder: blueprint,
		});
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = this.gridShape.getCenterPosition(this.cell);
		return new BattleButchery(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored);
		return new BattleButchery(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}
}
