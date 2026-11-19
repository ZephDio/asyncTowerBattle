import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Derive } from "../../../../../../traits/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { FrostTower } from "../../recruit/implementation/frost-tower";
import { FrostSpike } from "../../../../projectile/blueprint/implementation/frost-spike";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TTargeting } from "../../../../../shared/traits/engine/targeting";

export class FrostTowerBlueprint extends Derive(
	TRarity(Rarity.Rare),
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(TowerResources.frost.image, TowerResources.blue.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: 4,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(3),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 3.5,
		summonTime: NaN,
		range: 20,
	}),
	TowerTag,
	TTargeting,
) {
	toRecruit(cell: Cell) {
		return new FrostTower(cell, this);
	}

	description = new TowerDescription(
		"Frost Tower",
		["Makes an enormous", "frost boulder that", "falls and explodes on", "enemies, slowing them"],
		this,
	);
	type = "frost" as const;
	projectile = new FrostSpike();
}
