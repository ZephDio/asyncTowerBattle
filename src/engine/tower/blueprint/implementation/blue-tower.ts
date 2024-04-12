import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { Rocket } from "../../../projectile/blueprint/implementation/rocket";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { BlueTower } from "../../recruit/implementation/blue-tower-recruit";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Derive } from "../../../../../traits/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";

export class BlueTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDamageDealer(7),
	TImageDrawable(Resources.tower.blue.resource.image, Resources.tower.blue.size, 3),
) {
	toRecruit(cell: Cell) {
		return new BlueTower(cell, this);
	}
	type = "blue" as const;
	projectile = new Rocket();
}
