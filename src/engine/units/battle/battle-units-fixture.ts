import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { Path } from "../../path/entity/path";
import { PathFixture } from "../../path/entity/path-fixtures";
import { SoldierRecruit } from "../recruit/implementation/soldier-recruit";
import { UnitRecruitFixture } from "../recruit/unit-recruit-fixtures";
import { SoldierRecruitPhysic } from "./implementation/soldier-battle";

export class BattleUnitBuilder{
  public position: Position
  public path: Path
  
  positioned(position: Position){
    this.position = PercentToReal(position)
    return this
  }

  withPath(path: Path){
    this.path = path
    return this
  }
  
  buildSoldier(soldier: SoldierRecruit){
    return new SoldierRecruitPhysic(soldier, this.position, this.path, {} as any, () => {});
  }
}

export class BattleUnitFixture {
  static soldier = new BattleUnitBuilder().positioned({ x: 10, y: 90 }).withPath(PathFixture.defaultAllied).buildSoldier(UnitRecruitFixture.soldier)
}
