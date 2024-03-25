import { Dragon } from "../entity/implementation/dragon"
import { Soldier } from "../entity/implementation/soldier"
import { UnitFixture } from "../entity/unit-fixtures"
import { DragonRecruit } from "./implementation/dragon-recruit"
import { SoldierRecruit } from "./implementation/soldier-recruit"

export class UnitRecruitBuilder {
  buildSoldier(soldier: Soldier) {
    return new SoldierRecruit(soldier)
  }
  buildDragon(dragon: Dragon) {
    return new DragonRecruit(dragon)
  }
}

export class UnitRecruitFixture {
  static soldier = new UnitRecruitBuilder().buildSoldier(UnitFixture.soldier)
  static dragon = new UnitRecruitBuilder().buildDragon(UnitFixture.dragon)
}
