import { Trait } from "@ddd-ts/traits";
import { GridPosition } from "../../position";
import { BattlePath } from "../../../engine/path/battle/battle-path";
import { BattleArmyHooks } from "../../../engine/army/battle/battle-army";
import { AnyBattleUnit } from "../../../engine/units/battle/battle-unit";

export const TokenUnit = Trait((base) => {
  abstract class ITokenUnit extends base {
    abstract cost : number
    abstract toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) : AnyBattleUnit
  }
  return ITokenUnit
})