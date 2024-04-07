import { BasicTileBlueprint } from "./implementation/basic-path-blueprint";
import { SlowingTileBlueprint } from "./implementation/slowing-tile-blueprint";

export type AnyPathTileBlueprint = SlowingTileBlueprint | BasicTileBlueprint;
