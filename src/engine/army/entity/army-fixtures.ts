
import { BarracksFixture } from "../../barrack/battle/battle-barrack-fixture";
import { CastleEntityFixture } from "../../castle/entity/castle";
import { PathFixture } from "../../path/entity/path-fixtures";
import { TowerFixtures } from "../../tower/entity/tower-fixtures";
import { Army } from "./army";

export class ArmyFixture {
  static allied = new Army(
    CastleEntityFixture.allied,
    [
      //TowerFixtures.centerTower,
      TowerFixtures.BottomLeftTower,
      //TowerEntityFixtures.topRightTower,
    ],
    PathFixture.defaultAllied,
    //[]
    [BarracksFixture.soldier(2), BarracksFixture.dragon()]
  );
  static enemy = new Army(
    CastleEntityFixture.enemy,
    [
      //TowerFixtures.topRightTower,
      //TowerFixtures.BottomLeftTower,
      //TowerEntityFixtures.topRightTower,
    ],
    PathFixture.defaultEnemy,
    //[]
    [BarracksFixture.soldier(5)]
  );
}
