import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { Rocket } from "../../../projectile/entity/implementation/rocket";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { BlueTowerRecruit } from "../../recruit/implementation/blue-tower-recruit";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { Derive } from "../../../../../traits/traits";

export class BlueTower extends Derive(TDamageDealer(7), TImageDrawable(Resources.tower.blue.resource.image, Resources.tower.blue.size, 3)) {
  toRecruit(cell: Cell) {
    return new BlueTowerRecruit(this, cell);
  }
  type = "blue" as const;
  hitbox = new HitBox([[new HitShape("ellipse", { width: 5, height: 10 }), new Position({ x: 0, y: 0 })]]);
  projectile = new Rocket();
}
