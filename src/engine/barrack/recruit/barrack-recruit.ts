import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { AnyBattleBarrack } from "../battle/battle-barrack";
import { BasicBarrackRecruit } from "./implementation/basic-barrack-recruit";

export type AnyBarrackRecruit = BasicBarrackRecruit;
export const BarrackRecruit = Trait((base) => {
  abstract class BarrackRecruit extends base {
    abstract productionSpeed: number;
    abstract unitRecruit: null | ImplementsTrait<typeof UnitRecruit>;
    abstract toBattle(path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;

    setUnit(unit: ImplementsTrait<typeof UnitRecruit>) {
      this.unitRecruit = unit;
    }
  }
  return BarrackRecruit;
});
