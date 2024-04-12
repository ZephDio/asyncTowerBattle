import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../../shared/hitbox/shapes/ellipse";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { GridPosition } from "../../../../shared/position";
import { Resources } from "../../../../renderer/resources";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Berseker } from "../../recruit/implementation/berseker-recruit";
import { TDrawable } from "../../../../shared/traits/render/drawable";

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
