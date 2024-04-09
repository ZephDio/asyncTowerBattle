import { BlueBattleTower } from "./implementation/battle-blue-tower";
import { OrangeBattleTower } from "./implementation/battle-orange-tower";
import { YellowBattleTower } from "./implementation/battle-yellow-tower";
import { ZappingBattleTower } from "./implementation/battle-zapping-tower";
import { GreenBattleTower } from "./implementation/battle.green.tower";
import { FrostBattleTower } from "./implementation/frost-battle-tower";

export type AnyBattleTower =
	| BlueBattleTower
	| GreenBattleTower
	| OrangeBattleTower
	| YellowBattleTower
	| ZappingBattleTower
	| FrostBattleTower;
