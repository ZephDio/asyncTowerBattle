import { BattleCropsField } from "./implementation/battle-crops-field";
import { BattleGobelinPortal } from "./implementation/battle-gobelin-portal";
import { OrangeBattleTower } from "./implementation/battle-orange-totem";
import { BattleWindmill } from "./implementation/battle-windmill";

export type AnyBattleTotem = OrangeBattleTower | BattleGobelinPortal | BattleCropsField | BattleWindmill;
