import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Projectile } from "../projectile";

export class Bullet implements Projectile {
  type = "bullet" as const;
  hitbox = new HitBox([[new HitShape("ellipse", { width: 1, height: 1 }), { x: 0, y: 0 }]]);
  constructor(public baseSpeed: number = 3.2) {}
}
