import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/entity/path";
import { Unit } from "../../../units/entity/units";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { BasicBattleBarrack } from "../../battle/implementation/basic-battle-barrack";
import { BasicBarrack } from "../../entity/implementation/basic-barrack";
import { BarrackRecruit } from "../barrack-recruit";

export class BasicBarrackRecruit extends BarrackRecruit {
	constructor(barrack: BasicBarrack) {
		super(barrack);
	}
	unitRecruit: null | UnitRecruit<Unit>;
	toBattle(
		productionSpeed: number,
		path: BattlePath,
		hooks: BattleArmyHooks,
	): BasicBattleBarrack<BarrackRecruit> | undefined {
		if (this.unitRecruit) {
			return new BasicBattleBarrack(productionSpeed, this, path.enemyCastle.position, path, hooks, this.unitRecruit);
		}
		return undefined;
	}
}
