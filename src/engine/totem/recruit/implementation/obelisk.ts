
import { Cell } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleGrid } from "../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
import { Totem } from "../totem";
import { EvilTag } from "../../../../shared/traits/engine/tags";
import { RedObeliskBlueprint } from "../../blueprint/implementation/red-obelisk";
import { GridShape } from "../../../../shared/traits/engine/core/grid-element";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleRedObelisk } from "../../battle/implementation/battle-red-obelisk";

export class RedObelisk extends Derive(Totem, HTSynergy, EvilTag, RecruitCaster) {

    castSpeed: number;
    override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: 0, y: 1 })]);
	constructor(
		public cell: Cell,
		public bluePrint: RedObeliskBlueprint = new RedObeliskBlueprint({}),
	) {
		super({ synergy: bluePrint, imageDrawable: bluePrint, hitboxHolder: bluePrint, descriptor: bluePrint })
        this.castSpeed = bluePrint.castSpeed;
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks) {
		const position = this.gridShape.getCenterPosition(this.cell, this.orientation);
		return new BattleRedObelisk(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks) {
		const cell = BattleGrid.flip(grid, this.cell);
		const orientation = this.orientation + Math.PI;
		const position = this.gridShape.getCenterPosition(cell, orientation);
		return new BattleRedObelisk(this, hooks, position, cell, orientation);
	}

    get position() {
		return this.gridShape.getCenterPosition(this.cell, this.orientation);
	}
}
