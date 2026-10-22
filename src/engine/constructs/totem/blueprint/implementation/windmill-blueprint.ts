import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { Windmill } from "../../recruit/implementation/windmill";
import { FoodTag, TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";

export class WindmillBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(TotemResources.windmill.image, TotemResources.windmill.size, DrawPriority.NormalGridElement),
	TSynergy,
	FoodTag,
	TotemTag,
) {
	description = new Description("Windmill", [
		"▣ Food monuments",
		"gain 25% cast speed",
		"",
		"Gains 5max 🌽",
		"for each ▣ food monuments",
	]);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		if (hasTag(gridElement, "Food")) return true;
		return false;
	};
	override patternEffect: PatternEffect = new PatternEffect(
		[
			new Cell({ x: 1, y: 0 }),
			new Cell({ x: 2, y: 0 }),
			new Cell({ x: 0, y: 1 }),
			new Cell({ x: 0, y: 2 }),
			new Cell({ x: 0, y: -1 }),
			new Cell({ x: 0, y: -2 }),
			new Cell({ x: -1, y: 0 }),
			new Cell({ x: -2, y: 0 }),
		],
		this.patternCondition.bind(this),
	);

	toRecruit(cell: Cell) {
		return new Windmill(cell, this);
	}
}
