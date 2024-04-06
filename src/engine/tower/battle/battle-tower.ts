import { BlueBattleTower } from "./implementation/battle-blue-tower";
import { OrangeBattleTower } from "./implementation/battle-orange-tower";
import { YellowBattleTower } from "./implementation/battle-yellow-tower";
import { GreenBattleTower } from "./implementation/battle.green.tower";

export type AnyBattleTower = BlueBattleTower | GreenBattleTower | OrangeBattleTower | YellowBattleTower;
