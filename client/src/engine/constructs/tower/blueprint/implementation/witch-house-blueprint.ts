import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";

import { WitchHouse } from "../../recruit/implementation/witch-house";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TargetZone } from "../../../../target-zone/target-zone";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { EvilTag } from "../../../../../shared/traits/engine/tags/alignment/alignment-tags";
import { Science, TGrantsScience } from "../../../../../shared/traits/engine/science";
import { TTargeting } from "../../../../../shared/traits/engine/targeting";

export class WitchHouseBlueprint extends Derive(
	TRarity(Rarity.Rare),
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 10 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(TowerResources.witchHouse.image, TowerResources.witchHouse.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(6),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 5,
		summonTime: NaN,
		range: NaN,
	}),
	TowerTag,
	EvilTag,
	TTargeting,
	TGrantsScience(Science.Witchcraft),
) {
	// The cells on each side of the house's bottom cell and the one below it.
	override targetZone = new TargetZone([
		new Cell({ x: 1, y: 0 }),
		new Cell({ x: -1, y: 0 }),
		new Cell({ x: 0, y: -1 }),
	]);
	description = new TowerDescription(
		"Witch House",
		[
			"When an enemy is in",
			"its target zone, makes",
			"poison puddles on",
			"every path of the zone",
			"",
			"Poison: 6 damage/s",
		],
		this,
	);
	toRecruit(cell: Cell) {
		return new WitchHouse(cell, this);
	}
}
