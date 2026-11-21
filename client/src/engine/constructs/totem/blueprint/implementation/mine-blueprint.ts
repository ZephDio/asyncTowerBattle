import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
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
import { Mine } from "../../recruit/implementation/mine";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { MountainTag } from "../../../../../shared/traits/engine/tags/biome/biome-tags";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";

export class MineBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(15, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(TotemResources.mine.image, TotemResources.mine.size, DrawPriority.NormalGridElement),
	TSynergy,
	TotemTag,
	MountainTag,
) {
	// Gold given every time the shop is entered.
	readonly shopGold = 5;
	// Unit vitality army-buff stacks (💖) given at the start of battle when the star holds a Mountain.
	readonly vitalityStacks = 1;

	description = new Description("Gold Mine", [
		`Shop entered : gain ${this.shopGold} 🪙`,
		"",
		"Battle start : if ▣ is",
		`a Mountain, gain ${this.vitalityStacks} 💖`,
	]);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		return hasTag(gridElement, "Mountain");
	};
	override patternEffect: PatternEffect = new PatternEffect(
		[new Cell({ x: 1, y: 0 })],
		this.patternCondition.bind(this),
	);

	toRecruit(cell: Cell) {
		return new Mine(cell, this);
	}
}
