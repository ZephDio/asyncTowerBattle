import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Priest } from "../../recruit/implementation/priest-recruit";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";

export class PriestBlueprint extends Derive(
	TShopBlueprint(20, 6),
	THitbox(new HitBox([[new Rectangle({ width: 1.8, height: 2.2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TImageDrawable(Resources.unit.priest.resource.image, Resources.unit.priest.size, 4),
	TDamageDealer(0.5),
) {
	baseMaxLife = 22;
	baseSpeed = 0.16;
	attackSpeed = 4;

	cost = 160;
	type = "priest" as const;

	toRecruit(cell: Cell) {
		return new Priest(cell, this);
	}
}
