import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../../shared/position";
import { CAST_TIME, CasterDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { Brewery } from "../../recruit/implementation/brewery";
import { Barrack } from "../../../barrack/recruit/barrack";
import { BattleBarrack } from "../../../barrack/battle/battle-barrack";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { FoodTag, TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class BreweryBlueprint extends Derive(
	TRarity(Rarity.Epic),
	TShopBlueprint(15, 5),
	THitbox(new HitBox([[new Rectangle({ width: STANDARD_CELL_SIZE, height: 10 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(TotemResources.brewery.image, TotemResources.brewery.size, DrawPriority.NormalGridElement),
	TSynergy,
	FoodTag,
	TotemTag,
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: castSpeedFromSeconds(5),
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
) {
	description = new CasterDescription(
		"Cow-boy Brewery",
		[
			`Every ${CAST_TIME} seconds :`,
			"produce 0.5 🌽 per",
			"unit (max 8 🌽)",
			"At the max, gain 1 👢",
			"",
			"Start of battle,",
			"gain 1 👢 for each",
			"▣ barracks",
		],
		this,
	);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		return implementsTrait(gridElement, Barrack) || implementsTrait(gridElement, BattleBarrack);
	};
	patternEffect = new PatternEffect(
		[new Cell({ x: 1, y: 0 }), new Cell({ x: 0, y: -1 }), new Cell({ x: -1, y: -1 }), new Cell({ x: -2, y: 0 })],
		this.patternCondition.bind(this),
	);

	toRecruit(cell: Cell) {
		return new Brewery(cell, this);
	}
}
