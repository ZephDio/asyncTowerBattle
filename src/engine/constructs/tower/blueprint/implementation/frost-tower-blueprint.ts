import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../../renderer/resources";
import { TDamageDealer } from "../../../../../shared/traits/engine/damage-dealer";
import { Derive } from "../../../../../../traits/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { FrostTower } from "../../recruit/implementation/frost-tower";
import { FrostSpike } from "../../../../projectile/blueprint/implementation/frost-spike";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../../shared/traits/engine/food-consumer";

export class FrostTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDamageDealer(4),
	FoodConsumer,
	TDescriptor,
	TImageDrawable(Resources.tower.frost.resource.image, Resources.tower.blue.size, DrawPriority.NormalGridElement),
) {
	toRecruit(cell: Cell) {
		return new FrostTower(cell, this);
	}

	foodCost = 3.5;

	description = new TowerDescription(
		"Frost Tower",
		["Makes an enormous", "frost boulder that", "falls and explodes on", "enemies, slowing them"],
		{ damage: "4", range: "20", "cast speed": "1", "food consumption": "3.5" },
	);
	type = "frost" as const;
	projectile = new FrostSpike();
}
