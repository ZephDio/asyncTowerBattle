import { ImplementsTrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { BattleBarrack } from "../battle/battle-barrack";
import { Barrack } from "../entity/barrack";

export abstract class BarrackRecruit {
  public productionSpeed: number;
  constructor(barrack: Barrack) {
    this.productionSpeed = barrack.productionSpeed;
  }

  abstract unitRecruit: null | ImplementsTrait<typeof UnitRecruit>;
  abstract toBattle(productionSpeed: number, path: BattlePath, hooks: BattleArmyHooks): BattleBarrack<BarrackRecruit> | undefined;

  setUnit(unit: ImplementsTrait<typeof UnitRecruit>) {
    this.unitRecruit = unit;
  }
}
