import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../../renderer/resources";
import { ZappingTower } from "../../recruit/implementation/zapping-tower";
import { Spark } from "../../../../projectile/blueprint/implementation/spark";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";

export class ZappingTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.tower.purple.resource.image, Resources.tower.purple.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		damage: 15,
		attackSpeed: NaN,
		castSpeed: 1,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 3,
		summonTime: NaN,
		range: 20,
	}),
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
