import { BlueBattleTower } from "./implementation/battle-blue-tower";
import { YellowBattleTower } from "./implementation/battle-yellow-tower";
import { ZappingBattleTower } from "./implementation/battle-zapping-tower";
import { GreenBattleTower } from "./implementation/battle.green.tower";
import { FrostBattleTower } from "./implementation/frost-battle-tower";

export type AnyBattleTower =
	| BlueBattleTower
	| GreenBattleTower
	| YellowBattleTower
	| ZappingBattleTower
	| FrostBattleTower;
