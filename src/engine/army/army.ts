import { Castle, CastleEntity, CastleEntityFixture } from "../castle/domain/castle";
import { Path, PathFixture } from "../path/domain/path";
import { Tower, TowerEntity, TowerEntityFixtures } from "../tower/domain/tower";


export class Army {
    constructor(public castle: CastleEntity<Castle>, public towers: TowerEntity<Tower>[], public path: Path) { }
}


export const ArmyFixture = {
    allied: new Army(CastleEntityFixture.allied, [TowerEntityFixtures.centerTower, TowerEntityFixtures.BottomRightTower, TowerEntityFixtures.topRightTower], PathFixture.defaultAllied),
    enemy: new Army(CastleEntityFixture.enemy, [], PathFixture.defaultEnemy)
}