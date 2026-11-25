import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
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
import { MountainTag } from "../../../../../shared/traits/engine/tags/biome/biome-tags";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { Stonemason } from "../../recruit/implementation/stonemason";

const cellRectangle = () => new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE });

// sos
// sos
export class StonemasonBlueprint extends Derive(
	TRarity(Rarity.Uncommon),
	TShopBlueprint(15, 10),
	TRequiresScience(Science.Dwarf),
	// One square per cell of the footprint, relative to the anchor cell (the bottom one)
	THitbox(
		new HitBox([
			[cellRectangle(), new GridPosition({ x: 0, y: 0 })],
			[cellRectangle(), new GridPosition({ x: 0, y: STANDARD_CELL_SIZE })],
		]),
	),
	TDescriptor,
	TImageDrawable(TotemResources.stonemason.image, TotemResources.stonemason.size, DrawPriority.NormalGridElement),
	TSynergy,
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
	TotemTag,
	MountainTag,
) {
	readonly baseShields = 2;

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		return hasTag(gridElement, "Mountain");
	};

	override patternEffect = new PatternEffect(
		[new Cell({ x: -1, y: 0 }), new Cell({ x: 1, y: 0 }), new Cell({ x: -1, y: 1 }), new Cell({ x: 1, y: 1 })],
		this.patternCondition.bind(this),
	);

	description = new CasterDescription(
		"Stonemason",
		[
			`Every ${CAST_TIME} seconds :`,
			"give a stone shield to",
			"2 random allies without one",
			"",
			"+1 shield for each",
			"▣ mountain",
		],
		this,
	);

	toRecruit(cell: Cell) {
		return new Stonemason(cell, this);
	}
}
