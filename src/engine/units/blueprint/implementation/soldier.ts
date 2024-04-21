import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Soldier } from "../../recruit/implementation/soldier-recruit";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class SoldierBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 2, height: 2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.soldier.resource.image, Resources.unit.soldier.size, 4),
	TDamageDealer(1),
	FoodConsumer,
) {
	baseMaxLife = 6;
	baseSpeed = 0.32;
	attackSpeed = 5;

	foodCost = 0.6;
	cost = 75;

	description = new UnitDescription("Soldier", ["A lame unit", "that doesn't do", "anything special"], {
		health: "6",
		damage: "1",
		"move speed": "0.32",
		"production cost": "75",
	});
	toRecruit(cell: Cell) {
		return new Soldier(cell, this);
	}
}
