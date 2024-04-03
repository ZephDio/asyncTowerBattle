import { BasicPathTile } from "./implementation/basic-tile";
import { SlowingPathTile } from "./implementation/slowing-tile";

export type AnyPathTile = BasicPathTile | SlowingPathTile;
