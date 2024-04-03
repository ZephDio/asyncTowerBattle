import { BasicBattlePathTile } from "./implementation/basic-battle-tile";
import { SlowingBattlePathTile } from "./implementation/slowing-battle-tile";

export type AnyBattleTile = BasicBattlePathTile | SlowingBattlePathTile;
