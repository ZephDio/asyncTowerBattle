import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Dragon } from "../../recruit/implementation/dragon-recruit";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";

export class DragonBlueprint extends Derive(
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TImageDrawable(Resources.unit.dragon.resource.image, Resources.unit.dragon.size, 3),
	TDamageDealer(3),
) {
	baseMaxLife = 18;
	baseSpeed = 0.25;
	attackSpeed = 4;

	cost = 110;
	type = "dragon" as const;

	toRecruit(cell: Cell) {
		return new Dragon(cell, this);
	}
}
