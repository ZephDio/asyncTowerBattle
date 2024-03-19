import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import {
  Castle,
  CastleRecruit,
  CastleEntityFixture,
} from "../../castle/domain/castle";

export type PathNode = Position;

export class Path {
  constructor(
    public nodes: PathNode[],
    public type: string,
    public castleEntity: CastleRecruit<Castle>
  ) {}

  getNodes() {
    return [...this.nodes, this.castleEntity.position as Position];
  }
}

export const PathFixture = {
  defaultAllied: new Path(
    [
      { x: 10, y: 90 },
      { x: 10, y: 10 },
      { x: 40, y: 40 },
      { x: 55, y: 20 },
    ].map((position) => PercentToReal(position)),
    "normal",
    CastleEntityFixture.allied
  ),
  defaultEnemy: new Path(
    [
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 60, y: 60 },
      { x: 30, y: 65 },
    ].map((position) => PercentToReal(position)),
    "normal",
    CastleEntityFixture.enemy
  ),
};
