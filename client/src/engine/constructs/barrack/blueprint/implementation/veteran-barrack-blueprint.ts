import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../../shared/position";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { VeterantBarrack } from "../../recruit/implementation/veterant-barrack";
import { BarrackDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { BarrackResources } from "../../../../../renderer/resources/barrack.resources";
import { BarrackTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { SURROUNDING_CELLS_1X1, isBarrackWithOtherName } from "../../barrack-name-synergy";

export class VeterantBarrackBlueprint extends Derive(
	TRarity(Rarity.Epic),
	TShopBlueprint(10, 6),
	TDescriptor,
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(BarrackResources.veterant.image, BarrackResources.veterant.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: 0.6,
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
	TSynergy,
	BarrackTag,
) {
	description = new BarrackDescription(
		"Veterant Barrack",
		["Units spawn giant:", "-10% 🥾 +130 💚", "", "Cast 5% faster per ▣", "barrack of other name"],
		this,
	);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) =>
		isBarrackWithOtherName(this.description.name, gridElement);
	override patternEffect: PatternEffect = new PatternEffect(SURROUNDING_CELLS_1X1(), this.patternCondition.bind(this));

	toRecruit(cell: Cell) {
		return new VeterantBarrack(cell.clone(), this);
	}
}
