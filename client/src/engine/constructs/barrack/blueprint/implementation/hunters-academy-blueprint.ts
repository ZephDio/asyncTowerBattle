import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../../shared/position";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { Science, TGrantsScience } from "../../../../../shared/traits/engine/science";
import { HuntersAcademy } from "../../recruit/implementation/hunters-academy";
import { BarrackDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { BarrackResources } from "../../../../../renderer/resources/barrack.resources";
import { BarrackTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { SURROUNDING_CELLS_1X2, isBarrackWithOtherName, isForest } from "../../barrack-name-synergy";

const cellRectangle = () => new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE });

// sos
// sos, with a star above and one below
export class HuntersAcademyBlueprint extends Derive(
	TRarity(Rarity.Uncommon),
	TShopBlueprint(15, 10),
	TDescriptor,
	// One square per cell of the footprint, relative to the anchor cell (the bottom one)
	THitbox(
		new HitBox([
			[cellRectangle(), new GridPosition({ x: 0, y: 0 })],
			[cellRectangle(), new GridPosition({ x: 0, y: STANDARD_CELL_SIZE })],
		]),
	),
	TImageDrawable(
		BarrackResources.huntersAcademy.image,
		BarrackResources.huntersAcademy.size,
		DrawPriority.NormalGridElement,
	),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: 0.85,
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
	TSynergy,
	BarrackTag,
	TGrantsScience(Science.Trap),
) {
	description = new BarrackDescription(
		"Hunter's Association",
		["Cast 5% faster per ▣", "barrack of other name", "", "Cast 10% faster per ▣", "forest"],
		this,
	);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) =>
		isBarrackWithOtherName(this.description.name, gridElement) || isForest(gridElement);
	override patternEffect: PatternEffect = new PatternEffect(SURROUNDING_CELLS_1X2(), this.patternCondition.bind(this));

	toRecruit(cell: Cell) {
		return new HuntersAcademy(cell.clone(), this);
	}
}
