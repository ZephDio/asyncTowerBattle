import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { Barrack } from "../barrack-recruit";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/render/huds/unit-preview-enderable";
import { Cell } from "../../../../shared/position";
import { BattleGrid } from "../../../grid/battle-grid";
import { VeterantBattleBarrack } from "../../battle/implementation/veterant-battle-barrack";
import { VeterantBarrackBlueprint } from "../../blueprint/implementation/veteran-barrack";
import { HTFoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class VeterantBarrack extends Derive(TUnitPreviewHudRenderable, Barrack, HTFoodConsumer) {
	productionSpeed: number;

	constructor(
		public cell: Cell,
		barrack: VeterantBarrackBlueprint = new VeterantBarrackBlueprint({}),
	) {
		super({ imageDrawable: barrack, hitboxHolder: barrack, descriptor: barrack, foodConsumer: barrack });
		this.productionSpeed = barrack.productionSpeed;
	}
	unitRecruit: null | AnyUnit;

	get position() {
		return this.cell;
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BasicBattleBarrack {
		return new VeterantBattleBarrack(
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
		return new VeterantBattleBarrack(
			this,
			grid.cellToGrid(newPosition),
			newPosition,
			hooks,
			this.unitRecruit,
			orientation,
		);
	}
}
