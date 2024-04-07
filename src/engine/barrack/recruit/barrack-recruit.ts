import { Trait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyUnit } from "../../units/recruit/unit-recruit";
import { AnyBattleBarrack } from "../battle/battle-barrack";
import { BasicBarrack } from "./implementation/basic-barrack-recruit";
import { BattleGrid } from "../../grid/battle-grid";
import { WaveBarrack } from "./implementation/wave-barrack-recruit";

export type AnyBarrack = BasicBarrack | WaveBarrack;

export const Barrack = Trait((base) => {
	abstract class IBarrack extends base {
		abstract productionSpeed: number;
		abstract unitRecruit: null | AnyUnit;

		setUnit(unit: AnyUnit) {
			this.unitRecruit = unit;
		}

		abstract toAllied(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;
		abstract toEnemy(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;
	}
	return IBarrack;
});
