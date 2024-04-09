import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { TDrawable } from "../../../../shared/traits/tdrawable";
import { Priest } from "../../recruit/implementation/priest-recruit";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class PriestBlueprint extends Derive(
	TShopBlueprint(20, 6),
	THitbox(new HitBox([[new Rectangle({ width: 1.8, height: 2.2 }), new Position({ x: 0, y: 0 })]])),
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
