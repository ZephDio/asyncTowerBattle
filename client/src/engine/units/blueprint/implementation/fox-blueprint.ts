import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Fox } from "../../recruit/implementation/fox";
import { castSpeedFromSeconds, secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { AnimalTag } from "../../../../shared/traits/engine/tags/species/species-tag";
import { FoodTag } from "../../../../shared/traits/engine/tags/building/building-tags";

export class FoxBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 5),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.fox.image, UnitResources.fox.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 22,
		castleDamage: 1.5,
		projectileDamage: NaN,
		speed: 2.8,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: castSpeedFromSeconds(4.5),
		foodConsumption: 0.5,
		foodConsumptionOnCast: NaN,
		summonTime: secondsToFrame(1.8),
		range: NaN,
	}),
	AnimalTag,
	FoodTag,
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
