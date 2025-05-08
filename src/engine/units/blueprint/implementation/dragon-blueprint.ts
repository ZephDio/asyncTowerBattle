import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Dragon } from "../../recruit/implementation/dragon";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { seconds } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { MonsterTag } from "../../../../shared/traits/engine/tags/species/species-tag";

export class DragonBlueprint extends Derive(
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.dragon.resource.image, Resources.unit.dragon.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 18,
		speed: 0.25,
		attackSpeed: seconds(0.3),
		castSpeed: 4,
		damage: 3,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.6,
		summonTime: seconds(2.2),
		range: NaN,
	}),
	MonsterTag,
) {
	description = new UnitDescription("Dragon", ["Gains 1 max Health", "for each 5🪙 you own"], this);

	toRecruit(cell: Cell) {
		return new Dragon(cell, this);
	}
}
