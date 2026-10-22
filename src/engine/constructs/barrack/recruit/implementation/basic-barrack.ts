import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BasicBattleBarrack } from "../../battle/implementation/battle-basic-barrack";
import { BasicBarrackBlueprint } from "../../blueprint/implementation/basic-barrack-blueprint";
import { Barrack } from "../barrack";
import { TUnitPreviewHudRenderable } from "../../../../../shared/traits/render/huds/unit-preview-enderable";
import { Cell } from "../../../../../shared/position";
import { BattleGrid } from "../../../../grid/battle-grid";

export class BasicBarrack extends Derive(TUnitPreviewHudRenderable, Barrack) {
	constructor(
		public cell: Cell,
		barrack: BasicBarrackBlueprint = new BasicBarrackBlueprint({}),
	) {
		super({
			imageDrawable: barrack,
			hitboxHolder: barrack,
			descriptor: barrack,
			statsHolder: barrack,
			tagHolder: barrack,
		});
	}
	unitRecruit: null | AnyUnit;

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BasicBattleBarrack {
		return new BasicBattleBarrack(
			this,
			grid.cellToGrid(this.position),
			this.cell.clone(),
			hooks,
			this.unitRecruit,
			this.orientation,
		);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BasicBattleBarrack {
		const newPosition = BattleGrid.flip(grid, this.position);
		const orientation = this.orientation + Math.PI;
		return new BasicBattleBarrack(
			this,
			grid.cellToGrid(newPosition),
			newPosition,
			hooks,
			this.unitRecruit,
			orientation,
		);
	}
}
