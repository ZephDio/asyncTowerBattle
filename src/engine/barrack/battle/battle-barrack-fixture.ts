import { UnitRecruitFixture } from "../../units/recruit/unit-recruit-fixtures";
import { DragonBarrack } from "../entity/implementation/dragon-barrack";
import { SoldierBarrack } from "../entity/implementation/solider-barrack";

export class BarracksFixture {
    static soldier = (speed?: number) =>
        new SoldierBarrack(UnitRecruitFixture.soldier, speed);

    static dragon = (speed?: number) =>
        new DragonBarrack(UnitRecruitFixture.dragon, speed)
}