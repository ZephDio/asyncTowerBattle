import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { castSpeedFromSeconds, secondsToFrame } from "../../../../shared/seconds";
import { ForestTag } from "../../../../shared/traits/engine/tags/biome/biome-tags";
import { Ent } from "../../recruit/implementation/ent";
import { TBaseStats } from "../../../stats/base-stats";

export class EntBlueprint extends Derive(
	TShopBlueprint(15, 6),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.ent.resource.image, Resources.unit.ent.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 45,
		speed: 0.13,
		castSpeed: castSpeedFromSeconds(6),
		attackSpeed: secondsToFrame(0.3),
		damage: 3,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.5,
		summonTime: secondsToFrame(4.5),
		range: NaN,
	}),
	ForestTag,
) {
	override description = new UnitDescription("Ent", ["Throw a root that", "slow a building", "by 50% for 4s"], this);
	toRecruit(cell: Cell) {
		return new Ent(cell, this);
	}
}
