import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { Recruit } from "../../physic/physic";

const CastlePosition = {
  enemy: PercentToReal({ x: 10, y: 90 }),
  allied: PercentToReal({ x: 90, y: 10 }),
};

type Team = "allied" | "enemy";

export class Castle {
  constructor(public team: Team) { }
}

export class CastleRecruit<TB extends Castle> implements Recruit {
  position: Position;
  maxLife = 20;
  hitbox = new HitBox([
    [new HitShape("rectangle", { width: 5, height: 5 }), { x: 0, y: 0 }],
  ]);
  constructor(public castle: TB) {
    this.position = CastlePosition[castle.team];
  }
  clone() {
    return new CastleRecruit(new Castle(this.castle.team));
  }
}

export const CastleEntityFixture = {
  allied: new CastleRecruit(new Castle("allied")),
  enemy: new CastleRecruit(new Castle("enemy")),
};
