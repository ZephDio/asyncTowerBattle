import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { TDrawable, TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";

export class Dragon extends Derive(
  TDrawable,
  TImageDrawable(Resources.unit.dragon.resource.image, Resources.unit.dragon.size, 3),
  TDamageDealer(3)
) {
  baseMaxLife = 18;
  baseSpeed = 0.25;
  attackSpeed = 4;
  type = "dragon" as const;
  hitbox = new HitBox([[new HitShape("ellipse", { width: 3, height: 3 }), new Position({ x: 0, y: 0 })]]);
}
