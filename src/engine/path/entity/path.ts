import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../../shared/position";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { BattleGrid } from "../../grid/battle-grid";
import { Grid } from "../../grid/grid";
import { BattlePath, BattlePathTile } from "../battle/battle-path";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Resources } from "../../../renderer/resources";

export class PathTile extends Derive(TDrawable, TRenderable) {
  constructor(public cell: Cell) {
    super({});
  }

  get position() {
    return this.cell;
  }

  public drawPriority: number = 2;

  draw(context: CanvasRenderingContext2D, position: Position): void {
    const color = Resources.path.normal.resource;
    context.strokeStyle = "transparent";
    context.fillStyle = color;
    context.lineWidth = 0;
    const image = Resources.path.normal.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const size = this.getCanvasSize(context, 4.9, 4.9);
    const orientation = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2][Math.floor(position.x * position.y) % 3];
    this.drawImage(context, size, canvasPosition, image, orientation);
  }
}

export class ArmyPath {
  constructor(public tiles: PathTile[]) {}

  // getNodes() {
  //   return [...this.tiles, PercentToReal({ x: 10, y: 90 }) as Position];
  // }
  toAllied(_battleGrid: BattleGrid, grid: Grid, alliedCastle: BattleCastle, enemyCastle: BattleCastle) {
    return new BattlePath(
      this.tiles.map((tile) => new BattlePathTile(tile, tile.cell, grid.cellToReal(tile.cell))),
      alliedCastle,
      enemyCastle
    );
  }

  toEnemy(battleGrid: BattleGrid, grid: Grid, alliedCastle: BattleCastle, enemyCastle: BattleCastle) {
    return new BattlePath(
      this.tiles.map((tile) => {
        const flippedGridPosition = BattleGrid.flip(battleGrid, tile.cell);
        return new BattlePathTile(tile, flippedGridPosition, grid.cellToReal(flippedGridPosition));
      }),
      alliedCastle,
      enemyCastle
    );
  }

  checkInitialTile(gridHeight: number) {
    return this.tiles.find((tile) => tile.cell.x === 0 && tile.cell.y === gridHeight - 1);
  }
}
