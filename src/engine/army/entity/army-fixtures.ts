import { BarracksFixture } from "../../barrack/battle/battle-barrack-fixture";
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
      [BarracksFixture.soldier(2), BarracksFixture.dragon()]
    );
  }
  static get enemy() {
    return new Army(
      CastleRecruitFixture.enemy,
      [
        TowerRecruitFixtures.topRightTower,
        //TowerFixtures.BottomLeftTower,
        //TowerEntityFixtures.topRightTower,
      ],
      PathFixture.defaultEnemy,
      new Grid(),
      //[]
      [BarracksFixture.soldier(2), BarracksFixture.dragon()]
    );
  }
}
