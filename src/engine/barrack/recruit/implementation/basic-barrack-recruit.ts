import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { BasicBarrackBlueprint } from "../../blueprint/implementation/basic-barrack";
import { Barrack } from "../barrack-recruit";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/render/huds/unit-preview-enderable";
import { Cell } from "../../../../shared/position";
import { BattleGrid } from "../../../grid/battle-grid";
import { HTFoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class BasicBarrack extends Derive(TUnitPreviewHudRenderable, Barrack, HTFoodConsumer) {
	productionSpeed: number;

	constructor(
		public cell: Cell,
		barrack: BasicBarrackBlueprint = new BasicBarrackBlueprint({}),
	) {
		super({ imageDrawable: barrack, hitboxHolder: barrack, descriptor: barrack, foodConsumer: barrack });
		this.productionSpeed = barrack.productionSpeed;
	}
	unitRecruit: null | AnyUnit;

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
		if (this.unitRecruit) {
			return new BasicBattleBarrack(
				this,
				grid.cellToGrid(this.position),
				this.cell.clone(),
				hooks,
				this.unitRecruit,
				this.orientation,
			);
		}
		return undefined;
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BasicBattleBarrack | undefined {
		if (this.unitRecruit) {
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
		return undefined;
	}
}
