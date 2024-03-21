import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Rocket } from "../../../projectile/entity/implementation/rocket";
import { Tower } from "../tower";

export class BlueTower extends Tower {
  type = "blue" as const;
  hitbox = new HitBox([
    [new HitShape("ellipse", { width: 5, height: 10 }), { x: 0, y: 0 }],
  ]);
  projectile = new Rocket(1)
}
