import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { TDrawable } from "../../../../shared/traits/tdrawable";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";
import { Choupisson } from "../../recruit/implementation/choupisson-recruit";

export class ChoupissonBlueprint extends Derive(
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new Position({ x: 0, y: 0 })]])),
	TDrawable,
	TImageDrawable(Resources.unit.choupisson.resource.image, Resources.unit.choupisson.size, 3),
	TDamageDealer(3),
) {
	baseMaxLife = 18;
	baseSpeed = 0.25;
	attackSpeed = 4;

	cost = 110;

	toRecruit(cell: Cell) {
		return new Choupisson(cell, this);
	}
}
