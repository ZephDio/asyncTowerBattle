import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { seconds } from "../../../../shared/seconds";
import { ForestTag } from "../../../../shared/traits/engine/tags/biome/biome-tags";
import { Ent } from "../../recruit/implementation/ent";

export class EntBlueprint extends Derive(
	TShopBlueprint(15, 6),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.ent.resource.image, Resources.unit.ent.size, DrawPriority.NormalGridElement),
	TDamageDealer(1.5),
	FoodConsumer,
	ForestTag,
) {
	baseMaxLife = 18;
	baseSpeed = 0.13;
	attackSpeed = 4;

	foodCost = 1.5;

	cost = seconds(1);

	override description = new UnitDescription("Ent", ["Throw a root that", "slow a building", "by 50% for 4s"], {
		health: "18",
		damage: "3",
		"move speed": "0.13",
		"production time": "5.6s", // "production cost": "110
		"food consumption": "1.5",
	});
	toRecruit(cell: Cell) {
		return new Ent(cell, this);
	}
}
