import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Frog } from "../../recruit/implementation/frog";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { Science, TRequiresScience } from "../../../../shared/traits/engine/science";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { secondsToFrame } from "../../../../shared/seconds";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { AnimalTag } from "../../../../shared/traits/engine/tags/species/species-tag";
import { MagicTag } from "../../../../shared/traits/engine/tags/alignment/alignment-tags";

export class FrogBlueprint extends Derive(
	TRarity(Rarity.Epic),
	TShopBlueprint(15, 7),
	TRequiresScience(Science.Witchcraft),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.frog.image, UnitResources.frog.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: 25,
		speed: 1.2,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: NaN,
		castleDamage: 2,
		projectileDamage: NaN,
		foodConsumptionOnCast: NaN,
		foodConsumption: 0.5,
		summonTime: secondsToFrame(3.8),
		range: NaN,
	}),
	AnimalTag,
	MagicTag,
) {
	// Unit vitality army-buff stacks (💖) gained on death, and the seconds a random enemy unit is poisoned.
	readonly vitalityStacks = 1;
	readonly poisonSeconds = 2;

	description = new UnitDescription(
		"Frog",
		["On death :", `gain ${this.vitalityStacks} 💖 and poison`, "a random enemy", `unit for ${this.poisonSeconds}s`],
		this,
	);

	toRecruit(cell: Cell) {
		return new Frog(cell, this);
	}
}
