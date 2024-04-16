import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition, ScreenPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Dragon } from "../../recruit/implementation/dragon-recruit";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";

export class DragonBlueprint extends Derive(
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.dragon.resource.image, Resources.unit.dragon.size, 3),
	TDamageDealer(3),
) {
	description = new UnitDescription("Dragon", ["A unit that breath", "fire in a cone"], {
		health: "18",
		damage: "3",
		"move speed": "0.25",
		"production cost": "110",
	});

	baseMaxLife = 18;
	baseSpeed = 0.25;
	attackSpeed = 4;

	cost = 110;

	toRecruit(cell: Cell) {
		return new Dragon(cell, this);
	}
}
