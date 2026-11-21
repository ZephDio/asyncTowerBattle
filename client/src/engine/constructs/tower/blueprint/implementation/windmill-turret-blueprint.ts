import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";

import { Bullet } from "../../../../projectile/blueprint/implementation/bullet";
import { WindmillTurret } from "../../recruit/implementation/windmill-turret";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { FoodTag, TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TTargeting } from "../../../../../shared/traits/engine/targeting";

export class WindmillTurretBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(
		TowerResources.windmillTurret.image,
		TowerResources.windmillTurret.size,
		DrawPriority.NormalGridElement,
	),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: 10,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(1.5),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 1.5,
		summonTime: NaN,
		range: 20,
	}),
	TowerTag,
	FoodTag,
	TTargeting,
) {
	description = new TowerDescription(
		"Miller's Bolt",
		[
			"A windmill that shoots",
			"auto-guided fast bolts.",
			"The first time an ally",
			"hits the enemy castle,",
			"gain 20 🌽",
		],
		this,
	);

	toRecruit(cell: Cell) {
		return new WindmillTurret(cell, this);
	}
	projectile = new Bullet();
}
