import { Derive } from "@ddd-ts/traits";
import { Ellipse, HitBox, THitbox } from "../../../../shared/hitboxes";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { GridPosition } from "../../../../shared/position";
import { Resources } from "../../../../renderer/resources";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { Berseker } from "../../recruit/implementation/berseker-recruit";
import { TDrawable } from "../../../../shared/traits/tdrawable";

export class BersekerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Ellipse({ width: 2, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TImageDrawable(Resources.unit.berseker.resource.image, Resources.unit.berseker.size, 3),
	TDamageDealer(1),
) {
	baseMaxLife = 30;
	baseSpeed = 0.25;
	attackSpeed = 4;

	cost = 160;

	toRecruit(cell: any) {
		return new Berseker(cell, this);
	}
}
