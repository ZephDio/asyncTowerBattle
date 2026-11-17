import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem";
import { RecruitCaster } from "../../../../../shared/traits/engine/cast";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell } from "../../../../../shared/position";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { BreweryBlueprint } from "../../blueprint/implementation/brewery-blueprint";
import { BattleBrewery } from "../../battle/implementation/battle-brewery";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { HTBaseStats } from "../../../../stats/base-stats";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class Brewery extends Derive(Totem, RecruitCaster, HTSynergy, RecruitBattleStart, HTBaseStats) {
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: -1, y: 0 })]);
	constructor(
		public cell: Cell,
		public blueprint: BreweryBlueprint = new BreweryBlueprint({}),
	) {
		super({
			descriptor: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			synergy: blueprint,
			statsHolder: blueprint,
		});
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = this.gridShape.getCenterPosition(this.cell);
		return new BattleBrewery(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored);
		return new BattleBrewery(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}
}
