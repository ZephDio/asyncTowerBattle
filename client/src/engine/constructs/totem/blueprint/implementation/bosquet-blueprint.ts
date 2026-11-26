import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../../shared/position";
import { CAST_TIME, CasterDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { ForestTag } from "../../../../../shared/traits/engine/tags/biome/biome-tags";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { Bosquet } from "../../recruit/implementation/bosquet";

// xsx
// sos
// xsx
export class BosquetBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(10, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(TotemResources.bosquet.image, TotemResources.bosquet.size, DrawPriority.NormalGridElement),
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
	ForestTag,
) {
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		return hasTag(gridElement, "Forest");
	};

	override patternEffect = new PatternEffect(
		[new Cell({ x: 0, y: 1 }), new Cell({ x: -1, y: 0 }), new Cell({ x: 1, y: 0 }), new Cell({ x: 0, y: -1 })],
		this.patternCondition.bind(this),
	);

	description = new CasterDescription(
		"Bosquet",
		[
			"Animals get +0.5 🗡️",
			"",
			`Every ${CAST_TIME} seconds :`,
			"heal animals by 5 💚",
			"",
			"Trigger 10% faster",
			"for each ▣ forest",
		],
		this,
	);

	toRecruit(cell: Cell) {
		return new Bosquet(cell, this);
	}
}
