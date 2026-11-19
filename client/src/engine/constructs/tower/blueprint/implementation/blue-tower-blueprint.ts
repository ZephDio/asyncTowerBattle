import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Rocket } from "../../../../projectile/blueprint/implementation/rocket";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { BlueTower } from "../../recruit/implementation/blue-tower";
import { Derive } from "../../../../../../traits/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { TowerDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TTargeting } from "../../../../../shared/traits/engine/targeting";

export class BlueTowerBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(TowerResources.blue.image, TowerResources.blue.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: 7,
		castSpeed: castSpeedFromSeconds(2.5),
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 3,
		summonTime: NaN,
		range: 20,
	}),
	TowerTag,
	TTargeting,
) {
	toRecruit(cell: Cell) {
		return new BlueTower(cell, this);
	}

	description = new TowerDescription("Blue Tower", ["A tower that shoots", "missile that explode", "in an area"], this);
	type = "blue" as const;
	projectile = new Rocket();
}
