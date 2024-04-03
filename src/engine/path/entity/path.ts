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
    // const sortedTiles = this.isPathContinuous(this.tiles, grid);
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

  // isPathContinuous(tiles: AnyPathTile[], grid: Grid): AnyPathTile[] {
  //   const visited = new Set<string>();
  //   const result: AnyPathTile[] = [];

  //   function dfs(tile: AnyPathTile, previousVector: Position, result: AnyPathTile[], grid: Grid) {
  //     const key = Grid.posToString(tile.cell);
  //     if (visited.has(key)) return;
  //     visited.add(key);
  //     result.push(tile);
  //     if (key === `${grid.width - 1}|${grid.height - 2}`) {
  //       return;
  //     }

  //     for (const direction of [
  //       new Position({ x: 1, y: 0 }),
  //       new Position({ x: -1, y: 0 }),
  //       new Position({ x: 0, y: 1 }),
  //       new Position({ x: 0, y: -1 }),
  //     ].filter((d) => !(d.x == -previousVector.x && d.y == -previousVector.y))) {
  //       console.log(
  //         [new Position({ x: 1, y: 0 }), new Position({ x: -1, y: 0 }), new Position({ x: 0, y: 1 }), new Position({ x: 0, y: -1 })].filter(
  //           (d) => !(d.x == -previousVector.x && d.y == -previousVector.y)
  //         )
  //       );

  //       const nextCell = new Cell({ x: tile.cell.x + direction.x, y: tile.cell.y + direction.y });
  //       const nextKey = Grid.posToString(nextCell);
  //       const nextTile = tiles.find((t) => Grid.posToString(t.cell) === nextKey);
  //       // if (nextKey === `${grid.width - 1}|${grid.height - 1}`) {
  //       //   return;
  //       // }
  //       if (nextTile) {
  //         dfs(nextTile, direction, result, grid);
  //         return;
  //       }
  //       console.log("nextKey : ", nextKey, " ", `${grid.width - 1}|${grid.height - 1}`);
  //     }
  //     console.log(result);
  //     // If there are still unvisited points, the path is cut.
  //     throw new Error("Path is not continuous");
  //   }

  //   const firstTile = tiles.find((tile) => tile.cell.x === 0 && tile.cell.y === grid.height - 1);
  //   if (!firstTile) throw new Error("No initial tile found");

  //   dfs(firstTile, new Position({ x: 0, y: 0 }), result, grid);
  //   return result;
}
