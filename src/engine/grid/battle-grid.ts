import { GridPosition, Position } from "../../shared/position";
import { BattleCastle } from "../castle/battle/battle-castle";
import { PathTile } from "../path/entity/path";
import { BattleTower } from "../tower/battle/battle-tower";
import { Tower } from "../tower/entity/tower";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { Grid, GridElement, SerializedGrid } from "./grid";

export type BattleGridElement = BattleTower<TowerRecruit<Tower>> | PathTile | BattleCastle;
export class BattleGrid {
  grid: Map<GridPosition, BattleGridElement>;
  constructor(
    public gridAllied: Grid,
    public gridEnemy: Grid,
    public width: number,
    public height: number,
    public position: Position = { x: 2, y: 1.5 },
    public tileSize = 4.9
  ) {}

  gridPositionToReal(gridPosition: GridPosition) {
    return {
      x: this.position.x + (gridPosition.gridX + 0.5) * this.tileSize,
      y: this.position.y + (gridPosition.gridY + 0.5) * this.tileSize,
    };
  }

  static fuse(gridAllied: Grid, gridEnemy: Grid): BattleGrid {
    if (gridAllied.width !== gridEnemy.width || gridAllied.height !== gridEnemy.height) {
      throw new Error("cannot fuse grid with different grid size");
    }
    const battleGrid = new BattleGrid(
      gridAllied,
      gridEnemy,
      gridAllied.width,
      gridAllied.height + gridEnemy.height,
      gridAllied.position,
      gridAllied.tileSize
    );
    return battleGrid;
  }

  setElement(gridElement: GridElement, previousPosition?: GridPosition) {
    if (previousPosition) this.grid.delete(previousPosition);
    this.grid.set(gridElement.gridPosition, gridElement);
    console.log(this.grid);
  }

  toSerialized() {
    const serialized: SerializedGrid = {
      width: this.width,
      height: this.height,
      position: this.position,
      tileSize: this.tileSize,
    };
    return serialized;
  }

  static flip(battleGrid: BattleGrid, gridPosition: GridPosition) {
    const halfWidth = (battleGrid.width - 1) / 2;
    const halfHeight = (battleGrid.height - 1) / 2;
    return {
      gridX: halfWidth - gridPosition.gridX + halfWidth,
      gridY: halfHeight - gridPosition.gridY + halfHeight,
    };
  }
}
