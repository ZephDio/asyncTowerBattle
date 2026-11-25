import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Bullet } from "../../../../projectile/blueprint/implementation/bullet";
import { ForestCabin } from "../../recruit/implementation/forest-cabin";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, TowerDescription } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { ForestTag } from "../../../../../shared/traits/engine/tags/biome/biome-tags";
import { TTargeting } from "../../../../../shared/traits/engine/targeting";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { TargetZone } from "../../../../target-zone/target-zone";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";

export class ForestCabinBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(10, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(TowerResources.forestCabin.image, TowerResources.forestCabin.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: 8,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(1.15),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 1,
		summonTime: NaN,
		range: 20,
	}),
	TSynergy,
	TowerTag,
	ForestTag,
	TTargeting,
) {
	readonly castSpeedPercentPerForest = 10;
	readonly slowPercent = 50;
	readonly slowSeconds = 2;

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		return hasTag(gridElement, "Forest");
	};

	// The stars are above and below the cabin
	override patternEffect: PatternEffect = new PatternEffect(
		[new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })],
		this.patternCondition.bind(this),
	);

	// The cells on its left and right
	override targetZone = new TargetZone([new Cell({ x: -1, y: 0 }), new Cell({ x: 1, y: 0 })]);

	description = new TowerDescription(
		"Forest Cabin",
		[
			"Shoots slowing bolts",
			"at its left and right",
			`Hit enemies are ${this.slowPercent}%`,
			`slower for ${this.slowSeconds}s`,
			"",
			`Cast ${this.castSpeedPercentPerForest}% faster`,
			"for each ▣ forest",
		],
		this,
	);

	toRecruit(cell: Cell) {
		return new ForestCabin(cell, this);
	}
	projectile = new Bullet();
}
