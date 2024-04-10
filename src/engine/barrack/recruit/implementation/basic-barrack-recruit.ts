import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { BasicBarrackBlueprint } from "../../blueprint/implementation/basic-barrack";
import { Barrack } from "../barrack-recruit";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/drawable";
import { Cell } from "../../../../shared/position";
import { BattleGrid } from "../../../grid/battle-grid";

export class BasicBarrack extends Derive(TUnitPreviewHudRenderable, Barrack) {
	productionSpeed: number;

	constructor(
		public cell: Cell,
		barrack: BasicBarrackBlueprint = new BasicBarrackBlueprint({}),
	) {
		super({ imageDrawable: barrack, hitboxHolder: barrack });
		this.productionSpeed = barrack.productionSpeed;
	}
	unitRecruit: null | AnyUnit;

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
		if (this.unitRecruit) {
			return new BasicBattleBarrack(
				this,
				grid.cellToGrid(this.position),
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
				grid.cellToGrid(newPosition),
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
