import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

import { Bullet } from "../../../projectile/blueprint/implementation/bullet";
import { GreenTower } from "../../recruit/implementation/green-tower-recruit";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";

export class GreenTowerBlueprint extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.tower.green.resource.image, Resources.tower.green.size, 3),
	TDamageDealer(10),
) {
	type = "green" as const;

	toRecruit(cell: Cell) {
		return new GreenTower(this, cell);
	}
	projectile = new Bullet();
}
