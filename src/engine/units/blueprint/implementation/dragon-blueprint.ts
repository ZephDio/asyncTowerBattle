import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Dragon } from "../../recruit/implementation/dragon";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { MonsterTag } from "../../../../shared/traits/engine/tags/species/species-tag";
import { EvilTag } from "../../../../shared/traits/engine/tags/alignment/alignment-tags";
import { MountainTag } from "../../../../shared/traits/engine/tags/biome/biome-tags";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

export class DragonBlueprint extends Derive(
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.dragon.image, UnitResources.dragon.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 18,
		speed: 0.25,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: 4,
		damage: 3,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.6,
		summonTime: secondsToFrame(2.2),
		range: NaN,
	}),
	EvilTag,
	MountainTag,
	MonsterTag,
) {
	description = new UnitDescription("Dragon", ["Gains 1 max Health", "for each 5🪙 you own"], this);

	toRecruit(cell: Cell) {
		return new Dragon(cell, this);
	}
}
