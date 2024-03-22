import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { Recruit } from "../../../shared/physic";
import { Castle } from "../entity/castle";

const CastlePosition = {
  enemy: PercentToReal({ x: 10, y: 90 }),
  allied: PercentToReal({ x: 90, y: 10 }),
};

export class CastleRecruit<TB extends Castle> {
  type: string = "castle";
  position: Position;
  maxLife = 20;
  hitbox = new HitBox([[new HitShape("rectangle", { width: 5, height: 5 }), { x: 0, y: 0 }]]);
  constructor(public castle: TB) {
    this.position = CastlePosition[castle.team];
  }
  clone() {
    return new CastleRecruit(new Castle(this.castle.team));
  }
}
