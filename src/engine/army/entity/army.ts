import { Castle } from "../../castle/entity/castle";
import { CastleRecruit } from "../../castle/recruit/castle-recruit";
import { ArmyPath } from "../../path/entity/path";
import { AnyTowerRecruit } from "../../tower/recruit/tower-recruit";
import { Grid } from "../../grid/grid";
import { BarrackRecruit } from "../../barrack/recruit/barrack-recruit";
import { AnyTower } from "../../tower/entity/tower";
import { Cell } from "../../../shared/position";

export class Army {
  constructor(
    public castle: CastleRecruit<Castle>,
    public towers: AnyTowerRecruit[],
    public path: ArmyPath,
    public grid: Grid,
    public barracks: BarrackRecruit[]
  ) {}

  recruit(blueprint: AnyTower, tile: Cell) {
    const recruit = blueprint.toRecruit(tile);
    this.grid.setElement(recruit);
    this.towers.push(recruit);
  }

  isValidDestinationCell(cell: Cell) {
    const cellString = Grid.posToString(cell);
    return !this.grid.tiles.has(cellString)
  }

  add(recruit: AnyTowerRecruit) {
    this.grid.setElement(recruit);
    this.towers.push(recruit);
  }
}
