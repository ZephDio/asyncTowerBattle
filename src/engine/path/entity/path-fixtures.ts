import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { CastleEntityFixture } from "../../castle/entity/castle";
import { Path } from "./path";

export class PathFixture {
  static defaultAllied = new Path(
    [
      { x: 10, y: 90 },
      { x: 10, y: 10 },
      { x: 40, y: 40 },
      { x: 55, y: 20 },
    ].map((position) => PercentToReal(position)),
    "normal",
    CastleEntityFixture.allied
  );
  static defaultEnemy = new Path(
    [
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 60, y: 60 },
      { x: 30, y: 65 },
    ].map((position) => PercentToReal(position)),
    "normal",
    CastleEntityFixture.enemy
  );
}
