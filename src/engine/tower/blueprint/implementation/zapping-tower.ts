import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { ZappingTower } from "../../recruit/implementation/zapping-tower-recruit";
import { Spark } from "../../../projectile/blueprint/implementation/spark";

export class ZappingTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDamageDealer(15),
	TImageDrawable(Resources.tower.purple.resource.image, Resources.tower.purple.size, 3),
) {
	toRecruit(cell: Cell) {
		return new ZappingTower(cell, this);
	}

	projectile = new Spark();
}
