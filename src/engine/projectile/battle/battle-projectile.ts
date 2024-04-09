import { BattleRocket } from "./implementation/battle-rocket";
import { BattleBullet } from "./implementation/battle-bullet";
import { BattleSpark } from "./implementation/battle-spark";
import { BattleFrostSpike } from "./implementation/battle-frost-spike";

export type AnyBattleProjectile = BattleRocket | BattleBullet | BattleFrostSpike | BattleSpark;
