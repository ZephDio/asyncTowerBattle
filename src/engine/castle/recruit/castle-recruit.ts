import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { GridPosition, Position } from "../../../shared/position";
import { Grid } from "../../grid/grid";
import { Castle } from "../entity/castle";

const CastleGridPosition = {
  default: () => {
    return { gridX: 12, gridY: 5 };
  },
};

export class CastleRecruit<TB extends Castle> {
  type: string = "castle";
  maxLife = 20;
  gridPosition: GridPosition;
  hitbox = new HitBox([[new HitShape("rectangle", { width: 5, height: 5 }), { x: 0, y: 0 }]]);
  constructor(public castle: TB) {
    this.gridPosition = CastleGridPosition.default();
  }
  clone() {
    return new CastleRecruit(new Castle(this.castle.team));
  }

  toSerialized(grid: Grid): SerializedCastleRecruit {
    return {
      type: this.type,
      gridPosition: this.gridPosition,
      position: grid.gridPositionToReal(this.gridPosition),
    };
  }
}
export type SerializedCastleRecruit = {
  type: string;
  gridPosition: GridPosition;
  position: Position;
};
