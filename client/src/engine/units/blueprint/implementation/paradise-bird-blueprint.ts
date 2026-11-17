import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { ParadiseBird } from "../../recruit/implementation/paradise-bird";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { KinfolkTag } from "../../../../shared/traits/engine/tags/species/species-tag";
import { SkyTag } from "../../../../shared/traits/engine/tags/biome/biome-tags";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

export class ParadiseBirdBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.paradiseBird.image, UnitResources.paradiseBird.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 10,
		speed: 0.4,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: NaN,
		damage: 1,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.3,
		summonTime: secondsToFrame(1.6),
		range: NaN,
	}),
	KinfolkTag,
	SkyTag,
) {
	description = new UnitDescription("Paradise Bird", ["Leaves a powder", "trail that heals", "allies it passes"], this);

	toRecruit(cell: Cell) {
		return new ParadiseBird(cell, this);
	}
}
