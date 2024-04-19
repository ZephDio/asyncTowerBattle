import { BasicBattlePathTile } from "./implementation/basic-battle-tile";
import { SlowingBattlePathTile } from "./implementation/slowing-battle-tile";
import { TrapBattlePathTile } from "./implementation/trap-battle-tle";

export type AnyBattleTile = BasicBattlePathTile | SlowingBattlePathTile | TrapBattlePathTile;
