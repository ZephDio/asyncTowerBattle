import { BarrackRecruitFixtures } from "../../barrack/recruit/barrack-recruit-fixtures";
import { CastleRecruitFixture } from "../../castle/entity/castle";
import { Grid } from "../../grid/grid";
import { PathFixture } from "../../path/entity/path-fixtures";
import { TowerRecruitFixtures } from "../../tower/recruit/tower-recruit-fixtures";
import { Army } from "./army";

export class ArmyFixture {
  static get allied() {
    const grid = new Grid();
    const castle = CastleRecruitFixture.allied;
    const towers = [
      //TowerFixtures.centerTower,
      TowerRecruitFixtures.centerTower,
      //TowerEntityFixtures.topRightTower,
    ];
    const path = PathFixture.defaultAllied;
    const barracks = [BarrackRecruitFixtures.basicWithSoldier(4), BarrackRecruitFixtures.basicWithDragon(2)];
    [castle, ...towers, ...path.tiles].map((e) => grid.setElement(e));
    return new Army(castle, towers, path, grid, barracks);
  }
  static get enemy() {
    const grid = new Grid();
    const towers = [TowerRecruitFixtures.centerTower];
    const castle = CastleRecruitFixture.enemy;
    const path = PathFixture.defaultAllied;
    [castle, ...towers, ...path.tiles].map((e) => grid.setElement(e));

    return new Army(
      castle,
      towers,
      path,
      grid,
      //[]
      [BarrackRecruitFixtures.basicWithSoldier(4), BarrackRecruitFixtures.basicWithDragon(1)]
    );
  }
}
