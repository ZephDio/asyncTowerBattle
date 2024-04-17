import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { Barrack } from "../barrack-recruit";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/render/huds/unit-preview-enderable";
import { Cell } from "../../../../shared/position";
import { BattleGrid } from "../../../grid/battle-grid";
import { VeterantBattleBarrack } from "../../battle/implementation/veterant-battle-barrack";
import { VeterantBarrackBlueprint } from "../../blueprint/implementation/veteran-barrack";

export class VeterantBarrack extends Derive(TUnitPreviewHudRenderable, Barrack) {
	productionSpeed: number;

	constructor(
		public cell: Cell,
		barrack: VeterantBarrackBlueprint = new VeterantBarrackBlueprint({}),
	) {
		super({ imageDrawable: barrack, hitboxHolder: barrack, descriptor: barrack });
		this.productionSpeed = barrack.productionSpeed;
	}
	unitRecruit: null | AnyUnit;

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
		if (this.unitRecruit) {
			return new VeterantBattleBarrack(
				this,
				grid.cellToGrid(this.position),
				this.cell.clone(),
				path.enemyCastle.position,
				path,
				hooks,
				this.unitRecruit,
				this.orientation,
			);
		}
		return undefined;
	}

	toEnemy(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
		if (this.unitRecruit) {
			const newPosition = BattleGrid.flip(grid, this.position);
			const orientation = this.orientation + Math.PI;
			return new VeterantBattleBarrack(
				this,
				grid.cellToGrid(newPosition),
				newPosition,
				path.enemyCastle.position,
				path,
				hooks,
				this.unitRecruit,
				orientation,
			);
		}
		return undefined;
	}
}
