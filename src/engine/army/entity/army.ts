import { Castle } from "../../castle/entity/castle";
import { CastleRecruit } from "../../castle/recruit/castle-recruit";
import { ArmyPath } from "../../path/entity/path";
import { AnyTowerRecruit } from "../../tower/recruit/tower-recruit";
import { Grid } from "../../grid/grid";
import { AnyTower } from "../../tower/entity/tower";
import { Cell } from "../../../shared/position";
import { AnyPathTile } from "../../tile/entity/tile";
import { AnyBarrackRecruit } from "../../barrack/recruit/barrack-recruit";

export class Army {
  constructor(
    public castle: CastleRecruit<Castle>,
    public towers: AnyTowerRecruit[],
    public path: ArmyPath,
    public grid: Grid,
    public barracks: AnyBarrackRecruit[]
  ) {}

  recruit(blueprint: AnyTower, tile: Cell) {
    const recruit = blueprint.toRecruit(tile);
    this.grid.setElement(recruit);
    this.towers.push(recruit);
  }

  isValidDestinationCell(cell: Cell) {
    const cellString = Grid.posToString(cell);
    return !this.grid.tiles.has(cellString);
  }

  addTower(recruit: AnyTowerRecruit) {
    this.grid.setElement(recruit);
    this.towers.push(recruit);
  }

  addTile(tile: AnyPathTile) {
    this.grid.setElement(tile);
    this.path.tiles.push(tile);
  }
}
