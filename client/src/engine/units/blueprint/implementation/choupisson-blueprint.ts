import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { Choupisson } from "../../recruit/implementation/choupisson";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { AnimalTag } from "../../../../shared/traits/engine/tags/species/species-tag";

export class ChoupissonBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.choupisson.image, UnitResources.choupisson.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 18,
		speed: 0.25,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: NaN,
		damage: 3,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.8,
		summonTime: secondsToFrame(3.5),
		range: NaN,
	}),
	AnimalTag,
) {
	override description = new UnitDescription(
		"Choupisson",
		["Throw 3 projectiles", "in a cone on enemies", "when damaged"],
		this,
	);
	toRecruit(cell: Cell) {
		return new Choupisson(cell, this);
	}
}
