import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Dragon } from "../../recruit/implementation/dragon";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { seconds } from "../../../../shared/seconds";

export class DragonBlueprint extends Derive(
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.dragon.resource.image, Resources.unit.dragon.size, DrawPriority.NormalGridElement),
	TDamageDealer(3),
	FoodConsumer,
) {
	description = new UnitDescription("Dragon", ["Gains 1 max Health", "for each 5🪙 you own"], {
		health: "18",
		damage: "3",
		"move speed": "0.25",
		"food consumption": "1.6",
		"production time": "2s",
	});

	baseMaxLife = 18;
	baseSpeed = 0.25;
	attackSpeed = 4;

	foodCost = 1.6;

	cost = seconds(2.2);

	toRecruit(cell: Cell) {
		return new Dragon(cell, this);
	}
}
