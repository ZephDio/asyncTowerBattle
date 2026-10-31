import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Priest } from "../../recruit/implementation/priest";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { castSpeedFromSeconds, secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { KinfolkTag } from "../../../../shared/traits/engine/tags/species/species-tag";

export class PriestBlueprint extends Derive(
	TRarity(Rarity.Rare),
	TShopBlueprint(20, 6),
	THitbox(new HitBox([[new Rectangle({ width: 1.8, height: 2.2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.priest.image, UnitResources.priest.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 22,
		speed: 0.16,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: castSpeedFromSeconds(2),
		damage: 0.5,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.3,
		summonTime: secondsToFrame(2.6),
		range: NaN,
	}),
	KinfolkTag,
) {
	description = new UnitDescription("Priest", ["A unit that cast", "an healing area", "area around him"], this);

	toRecruit(cell: Cell) {
		return new Priest(cell, this);
	}
}
