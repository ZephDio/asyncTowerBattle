import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Derive } from "../../../../../traits/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { FrostTower } from "../../recruit/implementation/frost-tower-recruit";
import { FrostSpike } from "../../../projectile/blueprint/implementation/frost-spike";

export class FrostTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDamageDealer(4),
	TImageDrawable(Resources.tower.frost.resource.image, Resources.tower.blue.size, 3),
) {
	toRecruit(cell: Cell) {
		return new FrostTower(cell, this);
	}
	type = "frost" as const;
	projectile = new FrostSpike();
}
