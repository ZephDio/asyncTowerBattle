import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { HTGrantsScience } from "../../../../../shared/traits/engine/science";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { AnyUnit } from "../../../../units/recruit/unit";
import { Barrack } from "../barrack";
import { TUnitPreviewHudRenderable } from "../../../../../shared/traits/render/huds/unit-preview-enderable";
import { Cell } from "../../../../../shared/position";
import { BattleGrid } from "../../../../grid/battle-grid";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";
import { HuntersAcademyBlueprint } from "../../blueprint/implementation/hunters-academy-blueprint";
import { HuntersAcademyBattleBarrack } from "../../battle/implementation/battle-hunters-academy";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

// Two cells, the anchor and the one above it:
//   o
//   o
export class HuntersAcademy extends Derive(
	TUnitPreviewHudRenderable,
	Barrack,
	HTSynergy,
	RecruitBattleStart,
	HTGrantsScience,
) {
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: 0, y: 1 })]);

	constructor(
		public cell: Cell,
		public blueprint: HuntersAcademyBlueprint = new HuntersAcademyBlueprint({}),
	) {
		super({
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			statsHolder: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
			synergy: blueprint,
			scienceHolder: blueprint,
		});
	}
	unitRecruit: null | AnyUnit;

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks): HuntersAcademyBattleBarrack {
		return new HuntersAcademyBattleBarrack(
			this,
			this.gridShape.getCenterPosition(this.cell),
			this.cell.clone(),
			hooks,
			this.unitRecruit,
			BoardOrientation.Normal,
		);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): HuntersAcademyBattleBarrack {
		const cell = BattleGrid.flip(grid, this.cell);
		return new HuntersAcademyBattleBarrack(
			this,
			this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored),
			cell,
			hooks,
			this.unitRecruit,
			BoardOrientation.Mirrored,
		);
	}
}
