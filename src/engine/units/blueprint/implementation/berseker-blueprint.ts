import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../../shared/hitbox/shapes/ellipse";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { GridPosition } from "../../../../shared/position";
import { Resources } from "../../../../renderer/resources";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Berseker } from "../../recruit/implementation/berseker";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { seconds } from "../../../../shared/seconds";

export class BersekerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Ellipse({ width: 2, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.berseker.resource.image, Resources.unit.berseker.size, DrawPriority.NormalGridElement),
	TDamageDealer(2),
	FoodConsumer,
) {
	baseMaxLife = 23;
	baseSpeed = 0.25;
	attackSpeed = 4;

	foodCost = 2;

	cost = seconds(3);

	description = new UnitDescription(
		"Berseker",
		["A unit that enrage", "while damaged under", "half health gaining", "attack damage and", "movement speed"],
		{
			health: "23",
			damage: "2",
			"move speed": "0.25",
			"food consumption": "2",
			"production time": "3s",
		},
	);

	toRecruit(cell: any) {
		return new Berseker(cell, this);
	}
}
