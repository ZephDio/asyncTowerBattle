import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { ArmyPath, BattlePath } from "../../path/entity/path";
import { PathFixture } from "../../path/entity/path-fixtures";
import { SoldierRecruit } from "../recruit/implementation/soldier-recruit";
import { UnitRecruitFixture } from "../recruit/unit-recruit-fixtures";
import { BattleSoldier } from "./implementation/soldier-battle";

// export class BattleUnitBuilder {
//   public position: Position;
//   public path: BattlePath;

//   positioned(position: Position) {
//     this.position = PercentToReal(position);
//     return this;
//   }

//   withPath(path: BattlePath) {
//     this.path = path;
//     return this;
//   }

//   buildSoldier(soldier: SoldierRecruit) {
//     return new BattleSoldier(soldier, this.position, this.path, {} a);
//   }
// }

// export class BattleUnitFixture {
//   static soldier = new BattleUnitBuilder().positioned({ x: 10, y: 90 }).withPath(PathFixture.defaultAllied).buildSoldier(UnitRecruitFixture.soldier);
// }
