import { GridPosition, Position } from "../../shared/position";
import { BattleCastle } from "../castle/battle/battle-castle";
import { PathTile } from "../path/entity/path";
import { BattleTower } from "../tower/battle/battle-tower";
import { Tower } from "../tower/entity/tower";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { Grid, SerializedGrid } from "./grid";

export type BattleGridElement = BattleTower<TowerRecruit<Tower>> | PathTile | BattleCastle;
export class BattleGrid {
  grid: Map<number, Map<number, BattleGridElement>>;
  constructor(public width: number, public height: number, public position: Position = { x: 2, y: 1.5 }, public tileSize = 4.9) {}

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
    return new BattleGrid(gridAllied.width, gridAllied.height + gridEnemy.height);
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
}
