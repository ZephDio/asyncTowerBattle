import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Priest } from "../../recruit/implementation/priest";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { seconds } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";

export class PriestBlueprint extends Derive(
	TShopBlueprint(20, 6),
	THitbox(new HitBox([[new Rectangle({ width: 1.8, height: 2.2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.priest.resource.image, Resources.unit.priest.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 22,
		speed: 0.16,
		attackSpeed: seconds(0.3),
		castSpeed: 4,
		damage: 0.5,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.3,
		summonTime: seconds(2.6),
		range: NaN,
	}),
) {
	description = new UnitDescription("Priest", ["A unit that cast", "an healing area", "area around him"], this);

	toRecruit(cell: Cell) {
		return new Priest(cell, this);
	}
}
