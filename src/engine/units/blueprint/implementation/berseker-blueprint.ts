import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Ellipse } from "../../../../shared/hitbox/shapes/ellipse";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { GridPosition } from "../../../../shared/position";
import { Resources } from "../../../../renderer/resources";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { Berseker } from "../../recruit/implementation/berseker";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";

export class BersekerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Ellipse({ width: 2, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.berseker.resource.image, Resources.unit.berseker.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 23,
		speed: 0.25,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: NaN,
		damage: 2,
		foodConsumption: 2,
		foodConsumptionOnCast: NaN,
		summonTime: secondsToFrame(3),
		range: NaN,
	}),
) {
	description = new UnitDescription(
		"Berseker",
		["A unit that enrage", "while damaged under", "half health gaining", "attack damage and", "movement speed"],
		this,
	);

	toRecruit(cell: any) {
		return new Berseker(cell, this);
	}
}
