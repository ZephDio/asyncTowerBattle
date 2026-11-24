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
import { CornField } from "../../recruit/implementation/corn-field";
import { FoodTag, TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";

export class CornFieldBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(TotemResources.cornField.image, TotemResources.cornField.size, DrawPriority.NormalGridElement),
	FoodTag,
	TotemTag,
) {
	// Max food (and food) given at the start of the battle.
	readonly maxFood = 25;
	// Unit movement-speed stacks (👢) given the first time an allied unit hits the enemy castle.
	readonly speedStacks = 2;

	description = new Description("Corn Field", [
		`Battle start : +${this.maxFood} max 🌽`,
		"",
		"The first time an ally",
		"hits the enemy castle,",
		`units get ${this.speedStacks} 👢`,
	]);

	toRecruit(cell: Cell) {
		return new CornField(cell, this);
	}
}
