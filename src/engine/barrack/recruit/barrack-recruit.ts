import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/entity/path";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { BattleBarrack } from "../battle/battle-barrack";
import { Barrack } from "../entity/barrack";

export abstract class BarrackRecruit {
	public productionSpeed: number;
	constructor(barrack: Barrack) {
		this.productionSpeed = barrack.productionSpeed;
	}

	abstract unitRecruit: null | UnitRecruit<Unit>;
	abstract toBattle(
		productionSpeed: number,
		path: BattlePath,
		hooks: BattleArmyHooks,
	): BattleBarrack<BarrackRecruit> | undefined;

	setUnit(unit: UnitRecruit<Unit>) {
		this.unitRecruit = unit;
	}
}
