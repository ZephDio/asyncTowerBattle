import { BasicTileBlueprint } from "./implementation/basic-path-blueprint";
import { SlowingTileBlueprint } from "./implementation/slowing-tile-blueprint";
import { TrapTileBlueprint } from "./implementation/trap-tile-blueprint";

export type AnyPathTileBlueprint = SlowingTileBlueprint | BasicTileBlueprint | TrapTileBlueprint;
