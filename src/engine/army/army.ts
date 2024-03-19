import { Barrack } from "../barrack/barrack";
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

export class Army {
  constructor(
    public castle: CastleRecruit<Castle>,
    public towers: TowerRecruit<Tower>[],
    public path: Path,
    barracks: Barrack[]
  ) {}
}

export const ArmyFixture = {
  allied: new Army(
    CastleEntityFixture.allied,
    [
      TowerEntityFixtures.centerTower,
      TowerEntityFixtures.BottomRightTower,
      TowerEntityFixtures.topRightTower,
    ],
    PathFixture.defaultAllied,
    []
  ),
  enemy: new Army(CastleEntityFixture.enemy, [], PathFixture.defaultEnemy, []),
};
