import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { TDrawable } from "../../../../shared/traits/tdrawable";
import { Soldier } from "../../recruit/implementation/soldier-recruit";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class SoldierBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 2, height: 2 }), new Position({ x: 0, y: 0 })]])),
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
