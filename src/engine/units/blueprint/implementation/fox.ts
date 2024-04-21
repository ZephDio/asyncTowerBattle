import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Resources } from "../../../../renderer/resources";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { Fox } from "../../recruit/implementation/fox-recruit";

export class FoxBlueprint extends Derive(
	TShopBlueprint(15, 5),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.fox.resource.image, Resources.unit.fox.size, 3),
	TDamageDealer(1.5),
	FoodConsumer,
) {
	description = new UnitDescription("Glutton Fox", ["A unit that eat", "crops from your enemies", "as well"], {
		health: "22",
		damage: "1.5",
		"move speed": "0.18",
		"production cost": "150",
	});

	baseMaxLife = 22;
	baseSpeed = 0.18;
	attackSpeed = 4;

	foodCost = 0.5;
	cost = 150;

	castSpeed = 1;

	toRecruit(cell: Cell) {
		return new Fox(cell, this);
	}
}
