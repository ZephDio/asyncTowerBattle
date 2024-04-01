import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Cell, Position } from "../../../shared/position";
import { Grid } from "../../grid/grid";
import { Castle } from "../entity/castle";
import { Size } from "../../../shared/size";
import { Resources } from "../../../renderer/resources";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";

export class CastleRecruit<TB extends Castle> extends Derive(TDrawable, TRenderable) {
  type: string = "castle";
  maxLife = 20;
  cell: Cell;
  hitbox = new HitBox([[new HitShape("rectangle", { width: 5, height: 5 }), new Position({ x: 0, y: 0 })]]);

  constructor(public castle: TB) {
    super({});
    this.cell = new Cell({ x: 12, y: 5 });
  }

  clone() {
    return new CastleRecruit(new Castle(this.castle.team));
  }

  get position() {
    return this.cell;
  }

  drawPriority = 3;

  draw(context: CanvasRenderingContext2D, position: Position) {
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.castle.size as Size;
    const size = this.getCanvasSize(context, width, height);
    const image = Resources.castle.resource.image;
    this.drawImage(context, size, canvasPosition, image);
  }

  toSerialized(grid: Grid): SerializedCastleRecruit {
    return {
      type: this.type,
      cell: this.cell,
      position: grid.cellToReal(this.cell),
    };
  }
}

export type SerializedCastleRecruit = {
  type: string;
  cell: Cell;
  position: Position;
};
