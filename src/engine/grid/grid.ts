import { Derive, ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Cell, Position } from "../../shared/position";
import { TGridDrawable, TRenderable } from "../../shared/traits/drawable";
import { SynergyEffect } from "./grid-effects/synerny-effect";
import { TGrid } from "./tgrid";

export const GridElement = Trait((base) => {
  abstract class IGridElement extends base {
    abstract cell: Cell;
  }
  return IGridElement;
});

export type SerializedGrid = {
  width: number;
  height: number;
  position: Position;
  tileSize: number;
};

export class Grid extends Derive(TRenderable, TGrid, TGridDrawable) {
  tiles: Map<string, ImplementsTrait<typeof GridElement>> = new Map();
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

  getEnemyDoorCell() {
    return new Cell({ x: 0, y: this.height - 1 });
  }

  setOveredTile(cell: Cell | undefined) {
    this.overEffect = cell;
  }

  setSynergiesTiles(
    cell: Cell,
    relativeCellsSynergies: Cell[],
    isActivated: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean
  ) {
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
