import { UnitEntityFixture } from "../../units/entity/unit-fixtures";
import { DragonBarrack } from "../entity/implementation/dragon-barrack";
import { SoldierBarrack } from "../entity/implementation/solider-barrack";

export class BarracksFixture {
    static soldier = (speed?: number) =>
        new SoldierBarrack(UnitEntityFixture.soldier, speed);

    static dragon = (speed?: number) =>
        new DragonBarrack(UnitEntityFixture.dragon, speed)
}