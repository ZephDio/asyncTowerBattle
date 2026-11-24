import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../../shared/position";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { BarrackDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { BarrackResources } from "../../../../../renderer/resources/barrack.resources";
import { BarrackTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { SURROUNDING_CELLS_1X1, isBarrackWithOtherName } from "../../barrack-name-synergy";

export class WaveBarrackBlueprint extends Derive(
	TRarity(Rarity.Uncommon),
	TShopBlueprint(10, 10),
	TDescriptor,
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(BarrackResources.wave.image, BarrackResources.wave.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: 1,
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
		"Wave Barrack",
		["A barrack that", "spawn unit 3 by 3", "", "Cast 5% faster per ▣", "barrack of other name"],
		this,
	);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) =>
		isBarrackWithOtherName(this.description.name, gridElement);
	override patternEffect: PatternEffect = new PatternEffect(SURROUNDING_CELLS_1X1(), this.patternCondition.bind(this));

	toRecruit(cell: Cell) {
		return new WaveBarrack(cell.clone(), this);
	}
}
