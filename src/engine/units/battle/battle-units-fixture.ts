import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { SoldierBattleBarrack } from "../../barrack/battle/implementation/soldier-barrack";
import { PathFixture } from "../../path/entity/path-fixtures";
import { UnitEntityFixture } from "../entity/unit-fixtures";
import { SoldierRecruitPhysic } from "./implementation/soldier-battle";

export class BattleUnitFixture {
  static soldier = new SoldierRecruitPhysic(UnitEntityFixture.soldier, PercentToReal({ x: 10, y: 90 }), PathFixture.defaultAllied, {} as any, () => {});
}
