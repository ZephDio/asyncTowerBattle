import { BattleCastle } from "../../castle/battle/battle-castle";
import { BattleGrid } from "../../grid/battle-grid";
import { Grid } from "../../grid/grid";
import { BattlePath } from "../battle/battle-path";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyPathTile } from "../../tile/entity/tile";

export class ArmyPath {
  constructor(public tiles: AnyPathTile[]) {}

  // getNodes() {
  //   return [...this.tiles, PercentToReal({ x: 10, y: 90 }) as Position];
  // }
  toAllied(_battleGrid: BattleGrid, grid: Grid, alliedCastle: BattleCastle, enemyCastle: BattleCastle, hooks: BattleArmyHooks) {
    return new BattlePath(
      this.tiles.map((tile) => tile.toBattle(tile.cell, grid.cellToReal(tile.cell), hooks)),
      alliedCastle,
      enemyCastle
    );
  }

  toEnemy(battleGrid: BattleGrid, grid: Grid, alliedCastle: BattleCastle, enemyCastle: BattleCastle, hooks: BattleArmyHooks) {
    return new BattlePath(
      this.tiles.map((tile) => {
        const flippedGridPosition = BattleGrid.flip(battleGrid, tile.cell);
        return tile.toBattle(flippedGridPosition, grid.cellToReal(flippedGridPosition), hooks);
      }),
      alliedCastle,
      enemyCastle
    );
  }

  checkInitialTile(gridHeight: number) {
    return this.tiles.find((tile) => tile.cell.x === 0 && tile.cell.y === gridHeight - 1);
  }
}
