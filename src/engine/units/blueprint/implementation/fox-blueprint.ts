import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { Fox } from "../../recruit/implementation/fox";
import { seconds } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";

export class FoxBlueprint extends Derive(
	TShopBlueprint(15, 5),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.fox.resource.image, Resources.unit.fox.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 22,
		damage: 1.5,
		speed: 0.18,
		attackSpeed: seconds(0.3),
		castSpeed: 4,
		foodConsumption: 0.5,
		foodConsumptionOnCast: NaN,
		summonTime: seconds(1.8),
		range: NaN,
	}),
) {
	description = new UnitDescription(
		"Glutton Fox",
		["every 4.5 seconds", "consume 2🌽 from", "your enemy", "(scale with attack)"],
		this,
	);

	toRecruit(cell: Cell) {
		return new Fox(cell, this);
	}
}
