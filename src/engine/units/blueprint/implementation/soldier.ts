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

export class SoldierBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 2, height: 2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TImageDrawable(Resources.unit.soldier.resource.image, Resources.unit.soldier.size, 4),
	TDamageDealer(1),
) {
	baseMaxLife = 6;
	baseSpeed = 0.32;
	attackSpeed = 5;

	cost = 75;
	type = "soldier" as const;

	toRecruit(cell: Cell) {
		return new Soldier(cell, this);
	}
}
