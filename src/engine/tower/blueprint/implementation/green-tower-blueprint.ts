import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";

import { Bullet } from "../../../projectile/blueprint/implementation/bullet";
import { GreenTower } from "../../recruit/implementation/green-tower";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, TowerDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class GreenTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	FoodConsumer,
	TImageDrawable(Resources.tower.green.resource.image, Resources.tower.green.size, DrawPriority.NormalGridElement),
	TDamageDealer(10),
) {
	description = new TowerDescription("Green Tower", ["A tower that shoots", "auto-guided fast", "bullets"], {
		damage: "10",
		range: "3",
		"cast speed": "3",
		"cast cost": "100",
	});

	foodCost = 2;

	toRecruit(cell: Cell) {
		return new GreenTower(cell, this);
	}
	projectile = new Bullet();
}
