import { BarracksFixture } from "../../barrack/battle/implementation/soldier-barrack";
import { CastleEntityFixture } from "../../castle/entity/castle";
import { PathFixture } from "../../path/entity/path-fixtures";
import { TowerFixtures } from "../../tower/entity/tower-fixtures";
import { Army } from "./army";

export class ArmyFixture {
  static allied = new Army(
    CastleEntityFixture.allied,
    [
      //TowerEntityFixtures.centerTower,
      TowerFixtures.BottomLeftTower,
      //TowerEntityFixtures.topRightTower,
    ],
    PathFixture.defaultAllied,
    [
      BarracksFixture.soldier(2),
      BarracksFixture.soldier(3),
      BarracksFixture.soldier(4),
    ]
  );
  static enemy = new Army(
    CastleEntityFixture.enemy,
    [],
    PathFixture.defaultEnemy,
    [BarracksFixture.soldier(12.5)]
  );
}
