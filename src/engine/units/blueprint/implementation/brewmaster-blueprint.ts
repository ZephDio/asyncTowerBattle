import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../stats/base-stats";
import { Brewmaster } from "../../recruit/implementation/brewmaster";
import { castSpeedFromSeconds, secondsToFrame } from "../../../../shared/seconds";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { KinfolkTag } from "../../../../shared/traits/engine/tags/species/species-tag";

export class BrewmasterBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 12),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.brewmaster.image, UnitResources.brewmaster.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 40,
		speed: 0.22,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: castSpeedFromSeconds(2),
		damage: 3.5,
		foodConsumptionOnCast: NaN,
		foodConsumption: 5,
		summonTime: secondsToFrame(4),
		range: NaN,
	}),
	KinfolkTag,
) {
	override description = new UnitDescription("Brewmaster", ["Regenerate 15% of his", "life every 2 ", "seconds"], this);
	toRecruit(cell: Cell) {
		return new Brewmaster(cell, this);
	}
}
