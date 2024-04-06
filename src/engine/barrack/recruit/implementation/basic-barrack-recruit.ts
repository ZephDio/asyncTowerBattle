import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { AnyRecruitUnit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { BasicBarrack } from "../../entity/implementation/basic-barrack";
import { BarrackRecruit } from "../barrack-recruit";
import { HTImageDrawable, TUnitPreviewHudRenderable } from "../../../../shared/traits/drawable";
import { Cell } from "../../../../shared/position";
import { BattleGrid } from "../../../grid/battle-grid";
import { GridElement } from "../../../grid/grid";
import { HTHitbox, TGCollider } from "../../../../shared/hitboxes";

export class BasicBarrackRecruit extends Derive(
	TGCollider,
	HTHitbox,
	HTImageDrawable,
	TUnitPreviewHudRenderable,
	BarrackRecruit,
	GridElement,
) {
	productionSpeed: number;

	constructor(
		barrack: BasicBarrack,
		public cell: Cell,
	) {
		super({ imageDrawable: barrack, hitboxHolder: barrack });
		this.productionSpeed = barrack.productionSpeed;
	}
	unitRecruit: null | AnyRecruitUnit;

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
		if (this.unitRecruit) {
			return new BasicBattleBarrack(
				this,
				grid.cellToReal(this.position),
				this.cell.clone(),
				path.enemyCastle.position,
				path,
				hooks,
				this.unitRecruit,
			);
		}
		return undefined;
	}

	toEnemy(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
		if (this.unitRecruit) {
			const newPosition = BattleGrid.flip(grid, this.position);
			return new BasicBattleBarrack(
				this,
				grid.cellToReal(newPosition),
				newPosition,
				path.enemyCastle.position,
				path,
				hooks,
				this.unitRecruit,
			);
		}
		return undefined;
	}
}
