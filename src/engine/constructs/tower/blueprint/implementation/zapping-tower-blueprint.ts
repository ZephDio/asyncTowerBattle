import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { ZappingTower } from "../../recruit/implementation/zapping-tower";
import { Spark } from "../../../../projectile/blueprint/implementation/spark";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class ZappingTowerBlueprint extends Derive(
	TRarity(Rarity.Uncommon),
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(TowerResources.purple.image, TowerResources.purple.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		damage: 15,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(3.5),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 3,
		summonTime: NaN,
		range: 20,
	}),
	TowerTag,
) {
	toRecruit(cell: Cell) {
		return new ZappingTower(cell, this);
	}
	foodCost = 3;

	description = new TowerDescription(
		"Zapping Tower",
		["A tower that shoots", "lightning bolts that", "chain to nearby enemies"],
		this,
	);

	projectile = new Spark();
}
