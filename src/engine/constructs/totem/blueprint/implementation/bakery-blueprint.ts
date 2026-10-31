import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { Bakery } from "../../recruit/implementation/backery";
import { FoodTag, TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";

export class BakeryBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(10, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(TotemResources.bakery.image, TotemResources.bakery.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		damage: NaN,
		castSpeed: castSpeedFromSeconds(4),
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 5,
		summonTime: NaN,
		range: NaN,
	}),
	FoodTag,
	TotemTag,
) {
	description = new Description("Bakery Wryy", [
		"Every 4 seconds :",
		"consume 5🌽 and gain",
		"2💚 for units, otherwise",
		"produce 3🌽",
	]);

	toRecruit(cell: Cell) {
		return new Bakery(cell, this);
	}
}
