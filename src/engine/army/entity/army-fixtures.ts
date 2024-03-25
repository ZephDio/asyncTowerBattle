import { BarracksFixture } from "../../barrack/entity/barrack-fixtures";
import { CastleRecruitFixture } from "../../castle/recruit/castle-recruit-fixtures";
import { PathFixture } from "../../path/entity/path-fixtures";
import { TowerRecruitFixtures } from "../../tower/recruit/tower-recruit-fixtures";
import { Army } from "./army";

export class ArmyFixture {
  static get allied(){
    return new Army(
      CastleRecruitFixture.allied,
      [
        //TowerFixtures.centerTower,
        TowerRecruitFixtures.bottomLeftTower,
        //TowerEntityFixtures.topRightTower,
      ],
      PathFixture.defaultAllied,
      [BarracksFixture.soldier(2), BarracksFixture.soldier(3), BarracksFixture.soldier(4)]
      );
    } 
  static get enemy(){
    return new Army(
      CastleRecruitFixture.enemy,
      [
        TowerRecruitFixtures.topRightTower,
        //TowerFixtures.BottomLeftTower,
        //TowerEntityFixtures.topRightTower,
      ],
      PathFixture.defaultEnemy,
      [BarracksFixture.soldier(12)]
      );
    } 
}
