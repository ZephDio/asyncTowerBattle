import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { Choupisson } from "../../recruit/implementation/choupisson-recruit";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class ChoupissonBlueprint extends Derive(
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.choupisson.resource.image, Resources.unit.choupisson.size, 3),
	TDamageDealer(1.5),
	FoodConsumer,
) {
	baseMaxLife = 18;
	baseSpeed = 0.25;
	attackSpeed = 4;

	foodCost = 1.25;

	cost = 110;

	override description = new Description(
		"Choupisson",
		["Throw 3 projectiles", "in a cone on enemies", "when damaged"],
		{
			health: "18",
			damage: "3",
			"move speed": "0.25",
			"production cost": "110",
		},
	);
	toRecruit(cell: Cell) {
		return new Choupisson(cell, this);
	}
}
