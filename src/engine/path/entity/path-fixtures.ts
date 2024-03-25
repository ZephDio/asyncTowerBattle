import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { CastleRecruitFixture } from "../../castle/recruit/castle-recruit-fixtures";
import { Path } from "./path";

export class PathFixture {
  static get defaultAllied(){

    return new Path(
      [
        { x: 10, y: 55 },
        { x: 10, y: 10 },
        { x: 40, y: 10 },
        { x: 40, y: 45 },
      ].map((position) => PercentToReal(position)),
      "normal",
      CastleRecruitFixture.allied
      );
    } 
  static get defaultEnemy(){

    return new Path(
      [
        { x: 90, y: 45 },
        { x: 90, y: 90 },
        { x: 60, y: 90 },
        { x: 60, y: 55 },
      ].map((position) => PercentToReal(position)),
      "normal",
      CastleRecruitFixture.enemy
      );
    } 
}
