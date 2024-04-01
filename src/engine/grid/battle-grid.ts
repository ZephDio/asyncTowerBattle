import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../shared/position";
import { TDrawable, TRenderable } from "../../shared/traits/drawable";
import { BattleArmy } from "../army/battle/battle-army";
import { BattleCastle } from "../castle/battle/battle-castle";
import { AnyBattleTower } from "../tower/battle/battle-tower";
import { Grid, SerializedGrid } from "./grid";
import { BattlePathTile } from "../path/battle/battle-path";

export type BattleGridElement = AnyBattleTower | BattlePathTile | BattleCastle;
export class BattleGrid extends Derive(TDrawable, TRenderable) {
  tiles: Map<string, BattleGridElement> = new Map();

  constructor(
    public gridAllied: Grid,
    public gridEnemy: Grid,
    public width: number,
    public height: number,
    public position: Position = new Position({ x: 2, y: 1.5 }),
    public tileSize = 4.9
  ) {
    super({});
  }

  cellToReal(cell: Cell) {
    return new Position({
      x: this.position.x + (cell.x + 0.5) * this.tileSize,
      y: this.position.y + (cell.y + 0.5) * this.tileSize,
    });
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

  initElements(alliedArmy: BattleArmy, enemyArmy: BattleArmy) {
    const gridElements = [
      ...alliedArmy.towers,
      alliedArmy.castle,
      ...alliedArmy.path.tiles,
      ...enemyArmy.towers,
      enemyArmy.castle,
      ...enemyArmy.path.tiles,
    ];
    for (const gridElement of gridElements) {
      this.setElement(gridElement);
    }
  }

  setElement(gridElement: BattleGridElement) {
    this.tiles.set(Grid.posToString(gridElement.cell), gridElement);
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

  getRelativeNeighborsInArmy(armyGridPosition: Cell, relativePositions: Cell[], isEnemy: boolean) {
    const founds: BattleGridElement[] = [];
    for (const relativePosition of relativePositions) {
      const yCoordinate = armyGridPosition.y + (isEnemy ? -relativePosition.y : relativePosition.y);
      const targetPosition = new Cell({
        x: armyGridPosition.x + (isEnemy ? -relativePosition.x : relativePosition.x),
        y: yCoordinate,
      });
      const elementFound = this.tiles.get(Grid.posToString(targetPosition));
      if (elementFound) {
        founds.push(elementFound);
      }
    }
    return founds;
  }

  getRelativeNeighborsInBattle(cell: Cell, relativePositions: Cell[], isEnemy: boolean) {
    const founds: BattleGridElement[] = [];
    for (const relativePosition of relativePositions) {
      const targetPosition = new Cell({
        x: cell.x + (isEnemy ? -relativePosition.x : relativePosition.x),
        y: cell.y + (isEnemy ? -relativePosition.y : relativePosition.y),
      });
      const elementFound = this.tiles.get(Grid.posToString(targetPosition));
      if (elementFound) {
        founds.push(elementFound);
      }
    }
    return founds;
  }

  getAlliedHooks(): GridHooks {
    return {
      getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => {
        return this.getRelativeNeighborsInArmy(cell, relativePositions, false);
      },
      getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => {
        return this.getRelativeNeighborsInBattle(cell, relativePositions, false);
      },
    };
  }

  getEnemyHooks(): GridHooks {
    return {
      getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => {
        return this.getRelativeNeighborsInArmy(cell, relativePositions, true);
      },
      getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => {
        return this.getRelativeNeighborsInBattle(cell, relativePositions, true);
      },
    };
  }

  static flip(battleGrid: BattleGrid, cell: Cell) {
    const halfWidth = (battleGrid.width - 1) / 2;
    const halfHeight = (battleGrid.height - 1) / 2;
    return new Cell({
      x: halfWidth - cell.x + halfWidth,
      y: halfHeight - cell.y + halfHeight,
    });
  }

  drawPriority = 1;

  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#6C6";
    const position = this.getCanvasPosition(context, this.position);
    const tileSize = this.getCanvasSize(context, this.tileSize, this.tileSize).width;
    context.rect(position.x, position.y, this.width * tileSize, -this.height * tileSize);
    context.fill();

    context.lineWidth = 3;
    context.strokeStyle = "rgba(0,0,0,0.1)";
    for (const ci of new Array(this.width + 1).keys()) {
      this.drawLine(context, position.x + ci * tileSize, position.y, position.x + ci * tileSize, position.y - this.height * tileSize);
    }
    for (const ri of new Array(this.height + 1).keys()) {
      this.drawLine(context, position.x, position.y - ri * tileSize, position.x + this.width * tileSize, position.y - ri * tileSize);
    }
  }
}

export type GridHooks = {
  getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => BattleGridElement[];
  getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => BattleGridElement[];
};
