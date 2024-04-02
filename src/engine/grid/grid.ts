import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { Cell, Position } from "../../shared/position";
import { Castle } from "../castle/entity/castle";
import { CastleRecruit } from "../castle/recruit/castle-recruit";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { TDrawable, TRenderable } from "../../shared/traits/drawable";
import { SynergyEffect } from "./grid-effects/synerny-effect";
import { AnyPathTile } from "../tile/entity/tile";

export type GridElement = ImplementsTrait<typeof TowerRecruit> | AnyPathTile | CastleRecruit<Castle>;

export type SerializedGrid = {
  width: number;
  height: number;
  position: Position;
  tileSize: number;
};

export class Grid extends Derive(TDrawable, TRenderable) {
  tiles: Map<string, GridElement> = new Map();
  overEffect: Cell | undefined = undefined;
  synergiesEffects: SynergyEffect[] = [];

  constructor(
    public width: number = 13,
    public height: number = 6,
    public position: Position = new Position({ x: 2, y: 1.5 }),
    public cellSize = 4.9
  ) {
    super({});
  }

  cellToReal(cell: Cell) {
    return new Position({
      x: this.position.x + (cell.x + 0.5) * this.cellSize,
      y: this.position.y + (cell.y + 0.5) * this.cellSize,
    });
  }

  realPositionToGrid(position: Position) {
    const x = Math.round((position.x - this.position.x) / this.cellSize - 0.5);
    const y = Math.round((position.y - this.position.y) / this.cellSize - 0.5);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return new Cell({ x: x, y: y });
  }

  setOveredTile(cell: Cell | undefined) {
    this.overEffect = cell;
  }

  setSynergiesTiles(cell: Cell, relativeCellsSynergies: Cell[], isActivated: (gridElement: GridElement | undefined) => boolean) {
    this.clearSynergiesTiles();
    for (const synergyCell of relativeCellsSynergies) {
      this.synergiesEffects.push(
        new SynergyEffect(
          new Cell({
            x: cell.x + synergyCell.x,
            y: cell.y + synergyCell.y,
          }),
          this,
          isActivated
        )
      );
    }
  }

  clearSynergiesTiles() {
    this.synergiesEffects = [];
  }

  setElement(gridElement: GridElement) {
    this.tiles.set(Grid.posToString(gridElement.cell), gridElement);
  }

  deleteElement(gridElement: GridElement) {
    this.tiles.delete(Grid.posToString(gridElement.cell));
  }

  toSerialized() {
    const serialized: SerializedGrid = {
      width: this.width,
      height: this.height,
      position: this.position,
      tileSize: this.cellSize,
    };
    return serialized;
  }

  static posToString(cell: Cell) {
    return `${cell.x}|${cell.y}`;
  }

  drawPriority = 1;
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#6C6";
    const position = this.getCanvasPosition(context, this.position);
    const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
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
