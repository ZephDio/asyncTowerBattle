import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../../renderer/resources";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { CropsField } from "../../recruit/implementation/crops-field";
import { FoodTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";

export class CropsFieldBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(
		Resources.totem.cropsfield.resource.image,
		Resources.totem.cropsfield.size,
		DrawPriority.NormalGridElement,
	),
	TBaseStats({
		health: NaN,
		damage: NaN,
		castSpeed: castSpeedFromSeconds(3.5),
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
	FoodTag,
) {
	description = new Description("Crops Field", ["Every 3.5 seconds :", "produce 5🌽"]);

	toRecruit(cell: Cell) {
		return new CropsField(cell, this);
	}
}
