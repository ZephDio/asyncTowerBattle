import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { GoGoat } from "../../recruit/implementation/go-goat";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { MonsterTag } from "../../../../shared/traits/engine/tags/species/species-tag";
import { MountainTag } from "../../../../shared/traits/engine/tags/biome/biome-tags";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

export class GoGoatBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 7),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.goGoat.image, UnitResources.goGoat.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 20,
		speed: 0.22,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: NaN,
		damage: 2,
		foodConsumptionOnCast: NaN,
		foodConsumption: 3,
		summonTime: secondsToFrame(2),
		range: NaN,
	}),
	MountainTag,
	MonsterTag,
) {
	description = new UnitDescription("Go-Goat", ["A sturdy brute", "with a big appetite"], this);

	toRecruit(cell: Cell) {
		return new GoGoat(cell, this);
	}
}
