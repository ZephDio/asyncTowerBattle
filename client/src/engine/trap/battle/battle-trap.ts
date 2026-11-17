import { BattleSlowingTrap } from "./implementation/battle-slowing-trap";
import { BattleStunTrap } from "./implementation/battle-stun-trap";

export type AnyBattleTrap = BattleSlowingTrap | BattleStunTrap;
