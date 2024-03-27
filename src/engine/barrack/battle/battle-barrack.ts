import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/entity/path";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { BarrackRecruit } from "../recruit/barrack-recruit";

export class UnitProduction {
	progress = 0;
	constructor(
		public barrack: BattleBarrack<BarrackRecruit>,
		public resolve: () => void,
	) {}

	tick() {
		this.progress += this.barrack.productionSpeed;
		if (this.progress >= 100) {
			this.resolve();
		}
	}
}

export abstract class BattleBarrack<BR extends BarrackRecruit> {
	constructor(
		public barrackRecruit: BR,
		public productionSpeed: number,
		public position: Position,
		public path: BattlePath,
		public recruit: UnitRecruit<Unit>,
		public hooks: BattleArmyHooks,
	) {}

	abstract tick(): void;
}
