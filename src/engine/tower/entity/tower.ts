import { HitBox } from "../../../shared/hitboxes";
import { Projectile } from "../../projectile/entity/projectile";

export abstract class Tower {
  abstract type: "orange" | "blue" | "green";
  abstract hitbox: HitBox;
  abstract projectile: Projectile
}
