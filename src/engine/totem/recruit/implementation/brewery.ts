import { Derive } from "@ddd-ts/traits";
import { Totem } from "../totem-recruit";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleGrid } from "../../../grid/battle-grid";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell } from "../../../../shared/position";
import { FoodTag } from "../../../../shared/traits/engine/tags";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
import { BreweryBlueprint } from "../../blueprint/implementation/brewery-blueprint";
import { BattleBrewery } from "../../battle/implementation/battle-brewery";
import { GridShape } from "../../../../shared/traits/engine/core/grid-element";

export class Brewery extends Derive(Totem, RecruitCaster, HTSynergy, FoodTag) {
	castSpeed = 1;
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: -1, y: 0 })]);
	constructor(
		public cell: Cell,
		public blueprint: BreweryBlueprint = new BreweryBlueprint({}),
	) {
		super({ descriptor: blueprint, imageDrawable: blueprint, hitboxHolder: blueprint, synergy: blueprint });
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = this.gridShape.getCenterPosition(this.cell, this.orientation);
		return new BattleBrewery(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const orientation = this.orientation + Math.PI;
		const position = this.gridShape.getCenterPosition(cell, orientation);
		return new BattleBrewery(this, hooks, position, cell, orientation);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell, this.orientation);
	}
}
