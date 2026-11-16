import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { DrillTower } from "../../recruit/implementation/drill-tower";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { Rock } from "../../../../environment/rock";

const cellRectangle = () => new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE });

export class DrillTowerBlueprint extends Derive(
	TRarity(Rarity.Rare),
	TShopBlueprint(15, 6),
	// One square per cell of the L, relative to the anchor cell (the tower): the shed on its left, the drill below
	THitbox(
		new HitBox([
			[cellRectangle(), new GridPosition({ x: 0, y: 0 })],
			[cellRectangle(), new GridPosition({ x: -STANDARD_CELL_SIZE, y: 0 })],
			[cellRectangle(), new GridPosition({ x: 0, y: -STANDARD_CELL_SIZE })],
		]),
	),
	TDescriptor,
	TImageDrawable(TowerResources.drill.image, TowerResources.drill.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		damage: 25,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(6),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 5,
		summonTime: NaN,
		range: NaN,
	}),
	TSynergy,
	TowerTag,
) {
	// A rock on the star cell speeds the cast up from every 6 seconds to every 4.5 seconds
	rockCastSpeedPercent = (6 / 4.5 - 1) * 100;

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		return gridElement instanceof Rock;
	};
	// The star is on the left of the shed
	override patternEffect: PatternEffect = new PatternEffect(
		[new Cell({ x: -2, y: 0 })],
		this.patternCondition.bind(this),
	);

	toRecruit(cell: Cell) {
		return new DrillTower(cell, this);
	}

	description = new TowerDescription(
		"Drill Tower",
		[
			"A tower that shoots",
			"a giant drill straight",
			"ahead, piercing every",
			"enemy on its way",
			"",
			"if ▣ is a rock :",
			"casts every 4.5s",
		],
		this,
	);
}
