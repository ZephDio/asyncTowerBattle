import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { Barrack } from "../barrack-recruit";
import { HTImageDrawable, TUnitPreviewHudRenderable } from "../../../../shared/traits/drawable";
import { Cell } from "../../../../shared/position";
import { BattleGrid } from "../../../grid/battle-grid";
import { GridElement } from "../../../grid/grid";
import { HTHitbox, TGCollider } from "../../../../shared/hitboxes";
import { WaveBarrackBlueprint } from "../../blueprint/implementation/wave-barrack";
import { WaveBattleBarrack } from "../../battle/implementation/wave-battle-barrack";

export class WaveBarrack extends Derive(
	TGCollider,
	HTHitbox,
	HTImageDrawable,
	TUnitPreviewHudRenderable,
	Barrack,
	GridElement,
) {
	productionSpeed: number;

	constructor(
		barrack: WaveBarrackBlueprint,
		public cell: Cell,
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
			return new WaveBattleBarrack(
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
			return new WaveBattleBarrack(
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
