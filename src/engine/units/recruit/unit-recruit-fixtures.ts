import { Soldier } from "../entity/implementation/soldier"
import { UnitFixture } from "../entity/unit-fixtures"
import { SoldierRecruit } from "./implementation/soldier-recruit"

export class UnitRecruitBuilder {
    buildSoldier(soldier: Soldier){
      return new SoldierRecruit(soldier)
    }
  }
  
  export class UnitRecruitFixture {
    static soldier = new UnitRecruitBuilder().buildSoldier(UnitFixture.soldier)
  }
  