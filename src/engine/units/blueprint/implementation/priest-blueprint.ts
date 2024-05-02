import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Priest } from "../../recruit/implementation/priest";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class PriestBlueprint extends Derive(
	TShopBlueprint(20, 6),
	THitbox(new HitBox([[new Rectangle({ width: 1.8, height: 2.2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.priest.resource.image, Resources.unit.priest.size, DrawPriority.NormalGridElement),
	TDamageDealer(0.5),
	FoodConsumer,
) {
	baseMaxLife = 22;
	baseSpeed = 0.16;
	attackSpeed = 4;

	foodCost = 1.3;

	cost = 160;

	description = new UnitDescription("Priest", ["A unit that cast", "an healing area", "area around him"], {
		health: "22",
		damage: "0.5",
		"move speed": "0.16",
		"production cost": "160",
	});

	toRecruit(cell: Cell) {
		return new Priest(cell, this);
	}
}
