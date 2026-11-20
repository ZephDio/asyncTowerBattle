import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../../shared/position";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { RushBarrack } from "../../recruit/implementation/rush-barrack";
import { BarrackDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { BarrackResources } from "../../../../../renderer/resources/barrack.resources";
import { BarrackTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";

export class RushBarrackBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 10),
	TDescriptor,
	// One cell square per footprint cell: the anchor and the cell on its right.
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
			[
				new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }),
				new GridPosition({ x: STANDARD_CELL_SIZE, y: 0 }),
			],
		]),
	),
	TImageDrawable(BarrackResources.rush.image, BarrackResources.rush.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: 1.2,
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
	BarrackTag,
) {
	// The food each unit it summons eats on top of its own upkeep, every 2 seconds while it lives (a PermanentBuff).
	readonly extraFoodPerUnit = 1;

	description = new BarrackDescription(
		"Rush Barrack",
		[
			"A barrack that spawn",
			"units faster. Each",
			`unit eats +${this.extraFoodPerUnit}🌽 more`,
			"every 2s while alive",
		],
		this,
	);

	toRecruit(cell: Cell) {
		return new RushBarrack(cell.clone(), this);
	}
}
