import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, EnemyRender, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { BlacksmithTower } from "../../recruit/implementation/blacksmith-tower";
import { Derive } from "../../../../../../traits/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { BlacksmithDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TowerResources } from "../../../../../renderer/resources/tower.resources";
import { TowerTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TTargeting } from "../../../../../shared/traits/engine/targeting";
import { TargetZone } from "../../../../target-zone/target-zone";
import { EmberSpark } from "../../../../projectile/blueprint/implementation/ember-spark";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";

const cellRectangle = () => new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE });

export class BlacksmithTowerBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(10, 10),
	// One square per cell of the horizontal 2x1 piece, relative to the anchor cell (the left one)
	THitbox(
		new HitBox([
			[cellRectangle(), new GridPosition({ x: 0, y: 0 })],
			[cellRectangle(), new GridPosition({ x: STANDARD_CELL_SIZE, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(
		TowerResources.blacksmithTower.image,
		TowerResources.blacksmithTower.size,
		DrawPriority.NormalGridElement,
		EnemyRender.AxeFlip,
	),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: 4,
		attackSpeed: NaN,
		castSpeed: castSpeedFromSeconds(1.5),
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 3,
		summonTime: NaN,
		range: NaN,
	}),
	TowerTag,
	TTargeting,
) {
	// The three cells on the left of the piece, next to its left cell, one on each row: the cone of sparks opens toward
	// them.
	override targetZone = new TargetZone([
		new Cell({ x: -1, y: 1 }),
		new Cell({ x: -1, y: 0 }),
		new Cell({ x: -1, y: -1 }),
	]);

	// Sparks in a volley, shot from the anvil in a cone.
	sparksPerVolley = 7;
	// The opening of the cone around the direction of "left", in degrees: this far up and this far down.
	cone = { up: 68, down: 70 };
	// Where the sparks stop at the latest, in cells to the left of the middle of the left cell: the far edge of the
	// zone's cells, so every spark crosses them whole. The edge is flat, so a slanted spark flies longer to reach it.
	sparkReach = 1.5;
	// A spark never goes above or below the cells of the zone: this far, in cells, from the middle of the left cell.
	sparkVerticalLimit = 1.5;
	// Where the anvil is drawn, from the center of the left cell: this far to its left and this far above it.
	anvilOffset = { left: 0.9, above: 1.1 };

	projectile = new EmberSpark(1.5);

	toRecruit(cell: Cell) {
		return new BlacksmithTower(cell, this);
	}

	description = new BlacksmithDescription("Blacksmith Tower", this);

	// Every this many casts, the max health given to Kinfolk units grows by one.
	castsPerHealth = 4;
}
