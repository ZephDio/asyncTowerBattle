import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { WhiteStag } from "../../recruit/implementation/white-stag";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { castSpeedFromSeconds, secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { AnimalTag } from "../../../../shared/traits/engine/tags/species/species-tag";
import { ForestTag } from "../../../../shared/traits/engine/tags/biome/biome-tags";
import { MagicTag } from "../../../../shared/traits/engine/tags/alignment/alignment-tags";

export class WhiteStagBlueprint extends Derive(
	TRarity(Rarity.Rare),
	TShopBlueprint(20, 6),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.whiteStag.image, UnitResources.whiteStag.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 42,
		speed: 0.13,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: castSpeedFromSeconds(2),
		damage: 1.5,
		foodConsumptionOnCast: NaN,
		foodConsumption: 1.3,
		summonTime: secondsToFrame(3.5),
		range: NaN,
	}),
	AnimalTag,
	ForestTag,
	MagicTag,
) {
	description = new UnitDescription(
		"White Stag",
		["Casts a healing wave", "Drops a healing antler", "at 50% life and death"],
		this,
	);

	toRecruit(cell: Cell) {
		return new WhiteStag(cell, this);
	}
}
