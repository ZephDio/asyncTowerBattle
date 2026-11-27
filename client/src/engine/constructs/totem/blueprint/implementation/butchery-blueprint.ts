import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { Science, TRequiresScience } from "../../../../../shared/traits/engine/science";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../../shared/position";
import { CAST_TIME, CasterDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { Butchery } from "../../recruit/implementation/butchery";

const cellRectangle = () => new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE });

// oo
// os
export class ButcheryBlueprint extends Derive(
	TRarity(Rarity.Rare),
	TShopBlueprint(25, 5),
	TRequiresScience(Science.Dwarf),
	// One square per cell of the footprint, relative to the anchor cell (the bottom left one)
	THitbox(
		new HitBox([
			[cellRectangle(), new GridPosition({ x: 0, y: 0 })],
			[cellRectangle(), new GridPosition({ x: 0, y: STANDARD_CELL_SIZE })],
			[cellRectangle(), new GridPosition({ x: STANDARD_CELL_SIZE, y: STANDARD_CELL_SIZE })],
		]),
	),
	TDescriptor,
	TImageDrawable(TotemResources.butchery.image, TotemResources.butchery.size, DrawPriority.NormalGridElement),
	TSynergy,
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: castSpeedFromSeconds(6),
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
	TotemTag,
) {
	readonly buffsPerSacrifice = 3;
	// Added to the production speed of a barrack on the star that summons an Animal, on top of its own value (1.2 -> 1.3).
	readonly productionSpeedBonus = 0.1;

	// A barrack (in the shop or in battle) whose unit, the one put on it or else the army's default, is an Animal.
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement || !hasTag(gridElement, "Barrack") || !("bondedUnit" in gridElement)) return false;
		const unit = gridElement.bondedUnit;
		return typeof unit === "object" && unit !== null && hasTag(unit, "Animal");
	};

	override patternEffect = new PatternEffect([new Cell({ x: 1, y: 0 })], this.patternCondition.bind(this));

	description = new CasterDescription(
		"Butchery",
		[
			`Every ${CAST_TIME} seconds :`,
			"sacrifice a random ally",
			"animal, the army gains",
			"3 random buffs",
			"",
			"+0.1 production speed",
			"for an animal barrack on ▣",
		],
		this,
	);

	toRecruit(cell: Cell) {
		return new Butchery(cell, this);
	}
}
