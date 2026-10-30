import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { AnvilTotem } from "../../recruit/implementation/anvil";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { HTBaseStats } from "../../../../stats/base-stats";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class AnvilTotemBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TotemTag,
	TImageDrawable(TotemResources.anvil.image, TotemResources.anvil.size, DrawPriority.NormalGridElement),
	TSynergy,
) {
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		if (implementsTrait(gridElement, HTBaseStats)) {
			return gridElement.stats.hasDamage();
		}
		return false;
	};
	patternEffect = new PatternEffect(
		[new Cell({ x: 0, y: -1 }), new Cell({ x: 0, y: 1 })],
		this.patternCondition.bind(this),
	);
	toRecruit(cell: Cell) {
		return new AnvilTotem(cell, this);
	}
	description = new Description("Forging Anvil", ["A totem that boosts", "damage of ▣ towers", "by 30%"]);
	projectile = undefined;
}
