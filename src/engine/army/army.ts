import { Barrack } from "../barrack/barrack";
import { BarracksFixture } from "../barrack/soldier-barrack";
import {
  Castle,
  CastleRecruit,
  CastleEntityFixture,
} from "../castle/domain/castle";
import { Path, PathFixture } from "../path/domain/path";
import {
  Tower,
  TowerRecruit,
  TowerEntityFixtures,
} from "../tower/domain/tower";
import { Unit } from "../units/domain/units";

export class Army {
  constructor(
    public castle: CastleRecruit<Castle>,
    public towers: TowerRecruit<Tower>[],
    public path: Path,
    public barracks: Barrack<Unit>[]
  ) { }
}

export const ArmyFixture = {
  allied: new Army(
    CastleEntityFixture.allied,
    [
      //TowerEntityFixtures.centerTower,
      TowerEntityFixtures.BottomLeftTower,
      //TowerEntityFixtures.topRightTower,
    ],
    PathFixture.defaultAllied,
    [BarracksFixture.soldier(2), BarracksFixture.soldier(3), BarracksFixture.soldier(4)]
  ),
  enemy: new Army(CastleEntityFixture.enemy, [], PathFixture.defaultEnemy, [BarracksFixture.soldier(2)]),
};
