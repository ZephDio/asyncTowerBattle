import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";

import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { Recruit } from "../../physic/physic";
import { TowerEntityPhysic } from "../../physic/tower/entity-tower-physic";

export abstract class Tower {
  abstract type: "orange" | "blue" | "green";
  abstract hitbox: HitBox;
  clone() {
    switch (this.type) {
      case "orange":
        return new OrangeTower();
      case "blue":
        return new BlueTower();
      case "green":
        return new GreenTower();
    }
  }
}

export class BlueTower extends Tower {
  type = "blue" as const;
  hitbox = new HitBox([
    [new HitShape("ellipse", { width: 5, height: 10 }), { x: 0, y: 0 }],
  ]);
}
export class GreenTower extends Tower {
  type = "green" as const;
  hitbox = new HitBox([
    [new HitShape("rectangle", { width: 4, height: 6 }), { x: 0, y: 0 }],
  ]);
}
export class OrangeTower extends Tower {
  type = "orange" as const;
  hitbox = new HitBox([
    [new HitShape("ellipse", { width: 5, height: 5 }), { x: 0, y: 0 }],
  ]);
}

export class TowerRecruit<T extends Tower> implements Recruit {
  type: T["type"];
  hitbox: HitBox;
  constructor(public position: Position, public tower: T) {
    this.type = tower.type;
    this.hitbox = tower.hitbox;
  }

  toPhysic() {
    return new TowerEntityPhysic(this);
  }

  clone() {
    return new TowerRecruit(
      { x: this.position.x, y: this.position.y },
      this.tower.clone()
    );
  }
}

export class TowerEntityFixtures {
  static centerTower = new TowerRecruit(
    PercentToReal({ x: 50, y: 50 }),
    new BlueTower()
  );
  static topRightTower = new TowerRecruit(
    PercentToReal({ x: 80, y: 80 }),
    new OrangeTower()
  );
  static BottomRightTower = new TowerRecruit(
    PercentToReal({ x: 30, y: 30 }),
    new GreenTower()
  );
}
