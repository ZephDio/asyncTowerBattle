import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Bullet } from "../../../projectile/entity/implementation/bullet";
import { Tower } from "../tower";

export class GreenTower extends Tower {
  type = "green" as const;

  hitbox = new HitBox([
    [new HitShape("rectangle", { width: 4, height: 6 }), { x: 0, y: 0 }],
  ]);
  projectile = new Bullet(1)
}
