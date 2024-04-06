import { Trait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyRecruitUnit } from "../../units/recruit/unit-recruit";
import { AnyBattleBarrack } from "../battle/battle-barrack";
import { BasicBarrackRecruit } from "./implementation/basic-barrack-recruit";
import { BattleGrid } from "../../grid/battle-grid";
import { WaveBarrackRecruit } from "./implementation/wave-barrack-recruit";

export type AnyBarrackRecruit = BasicBarrackRecruit | WaveBarrackRecruit;

export const BarrackRecruit = Trait((base) => {
	abstract class BarrackRecruit extends base {
		abstract productionSpeed: number;
		abstract unitRecruit: null | AnyRecruitUnit;

		setUnit(unit: AnyRecruitUnit) {
			this.unitRecruit = unit;
		}

		abstract toAllied(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;
		abstract toEnemy(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;
	}
	return BarrackRecruit;
});
