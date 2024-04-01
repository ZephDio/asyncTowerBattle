import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitboxes";
import { TDrawable } from "../../../shared/traits/drawable";

export abstract class Projectile extends Derive(TDrawable) {
  abstract hitbox: HitBox;
  abstract baseSpeed: number;

  drawPriority = 3;
}
