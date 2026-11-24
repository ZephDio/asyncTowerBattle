import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { AnyUnit } from "../../../../units/recruit/unit";
import { Barrack } from "../barrack";
import { TUnitPreviewHudRenderable } from "../../../../../shared/traits/render/huds/unit-preview-enderable";
import { Cell } from "../../../../../shared/position";
import { BattleGrid } from "../../../../grid/battle-grid";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";
import { RushBarrackBlueprint } from "../../blueprint/implementation/rush-barrack-blueprint";
import { RushBattleBarrack } from "../../battle/implementation/battle-rush-barrack";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

// Two cells side by side, anchored on the left one:
//   oo
export class RushBarrack extends Derive(TUnitPreviewHudRenderable, Barrack, HTSynergy, RecruitBattleStart) {
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: 1, y: 0 })]);

	constructor(
		public cell: Cell,
		public blueprint: RushBarrackBlueprint = new RushBarrackBlueprint({}),
	) {
		super({
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			statsHolder: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
			synergy: blueprint,
		});
	}
	unitRecruit: null | AnyUnit;

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks): RushBattleBarrack {
		return new RushBattleBarrack(
			this,
			this.gridShape.getCenterPosition(this.cell),
			this.cell.clone(),
			hooks,
			this.unitRecruit,
			BoardOrientation.Normal,
		);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): RushBattleBarrack {
		const cell = BattleGrid.flip(grid, this.cell);
		return new RushBattleBarrack(
			this,
			this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored),
			cell,
			hooks,
			this.unitRecruit,
			BoardOrientation.Mirrored,
		);
	}
}
