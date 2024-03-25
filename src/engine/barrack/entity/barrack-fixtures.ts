import { SoldierRecruit } from "../../units/recruit/implementation/soldier-recruit";
import { UnitRecruitFixture } from "../../units/recruit/unit-recruit-fixtures";
import { SoldierBarrack } from "./implementation/solider-barrack";

export class BarrackBuilder{
    productionSpeed: number | undefined

    withProductionSpeed(speed: number | undefined){
        this.productionSpeed = speed
        return this
    }

    buildSoldier(soldier: SoldierRecruit){
      return new SoldierBarrack(soldier, this.productionSpeed);
    }
}

export class BarracksFixture {
    static soldier(speed?: number){
      return new BarrackBuilder().withProductionSpeed(speed).buildSoldier(UnitRecruitFixture.soldier);
  }
}

