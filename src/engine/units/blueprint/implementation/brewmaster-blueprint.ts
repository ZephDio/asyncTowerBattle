import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { Resources } from "../../../../renderer/resources";
import { TBaseStats } from "../../../stats/base-stats";
import { Brewmaster } from "../../recruit/implementation/brewmaster";
import { seconds } from "../../../../shared/seconds";

export class BrewmasterBlueprint extends Derive(
	TShopBlueprint(15, 12),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(
		Resources.unit.brewmaster.resource.image,
		Resources.unit.brewmaster.size,
		DrawPriority.NormalGridElement,
	),
	TBaseStats({
		health: 40,
		speed: 0.22,
		attackSpeed: seconds(0.3),
		castSpeed: 4,
		damage: 3.5,
		foodConsumptionOnCast: NaN,
		foodConsumption: 5,
		summonTime: seconds(4),
		range: NaN,
	}),
) {
	override description = new UnitDescription("Brewmaster", ["Regenerate 15% of his", "life every 2 ", "seconds"], this);
	toRecruit(cell: Cell) {
		return new Brewmaster(cell, this);
	}
}
