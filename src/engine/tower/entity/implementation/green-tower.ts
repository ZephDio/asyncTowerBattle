import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

import { Bullet } from "../../../projectile/entity/implementation/bullet";
import { GreenTowerRecruit } from "../../recruit/implementation/green-tower-recruit";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";

export class GreenTower extends Derive(
  TImageDrawable(Resources.tower.green.resource.image, Resources.tower.green.size, 3),
  TDamageDealer(10)
) {
  type = "green" as const;

  toRecruit(cell: Cell) {
    return new GreenTowerRecruit(this, cell);
  }

  hitbox = new HitBox([[new HitShape("rectangle", { width: 4, height: 6 }), new Position({ x: 0, y: 0 })]]);
  projectile = new Bullet();
}
