import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { ZappingTower } from "../../recruit/implementation/zapping-tower-recruit";
import { Spark } from "../../../projectile/blueprint/implementation/spark";

export class ZappingTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TDamageDealer(10),
	TImageDrawable(Resources.tower.purple.resource.image, Resources.tower.purple.size, 3),
) {
	toRecruit(cell: Cell) {
		return new ZappingTower(cell, this);
	}

	projectile = new Spark();
}
