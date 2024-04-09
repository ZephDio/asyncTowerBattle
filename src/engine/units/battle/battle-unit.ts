import { BattlePriest } from "./implementation/battle-priest";
import { BattleDragon } from "./implementation/dragon-battle";
import { BattleSoldier } from "./implementation/soldier-battle";

export type AnyBattleUnit = BattleDragon | BattleSoldier | BattlePriest;
