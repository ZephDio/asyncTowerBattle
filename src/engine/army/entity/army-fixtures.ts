import { BarrackRecruitFixtures } from "../../barrack/recruit/barrack-recruit-fixtures";
import { CastleRecruitFixture } from "../../castle/entity/castle";
import { Grid } from "../../grid/grid";
import { PathFixture } from "../../path/entity/path-fixtures";
import { TowerRecruitFixtures } from "../../tower/recruit/tower-recruit-fixtures";
import { Army } from "./army";

export class ArmyFixture {
  static get allied() {
    return new Army(
      CastleRecruitFixture.allied,
      [
        //TowerFixtures.centerTower,
        TowerRecruitFixtures.centerTower,
        //TowerEntityFixtures.topRightTower,
      ],
      PathFixture.defaultAllied,
      new Grid(),
      //[]
      [BarrackRecruitFixtures.basicWithSoldier(4), BarrackRecruitFixtures.basicWithDragon(2)]
    );
  }
  static get enemy() {
    return new Army(
      CastleRecruitFixture.enemy,
      [
        TowerRecruitFixtures.centerTower,
        //TowerFixtures.BottomLeftTower,
        //TowerEntityFixtures.topRightTower,
      ],
      PathFixture.defaultAllied,
      new Grid(),
      //[]
      [BarrackRecruitFixtures.basicWithSoldier(4), BarrackRecruitFixtures.basicWithDragon(1)]
    );
  }
}
