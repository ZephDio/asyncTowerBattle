import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { Rocket } from "../../../projectile/blueprint/implementation/rocket";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { BlueTower } from "../../recruit/implementation/blue-tower-recruit";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Derive } from "../../../../../traits/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TowerDescription, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class BlueTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TDamageDealer(7),
	FoodConsumer,
	TImageDrawable(Resources.tower.blue.resource.image, Resources.tower.blue.size, DrawPriority.NormalGridElement),
) {
	toRecruit(cell: Cell) {
		return new BlueTower(cell, this);
	}
	foodCost = 2;

	description = new TowerDescription("Blue Tower", ["A tower that shoots", "missile that explode", "in an area"], {
		damage: "7",
		range: "20",
		"cast speed": "1.2",
		"cast cost": "100",
	});
	type = "blue" as const;
	projectile = new Rocket();
}
