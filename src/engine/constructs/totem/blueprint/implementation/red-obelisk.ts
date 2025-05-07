import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../../renderer/resources";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { RedObelisk } from "../../recruit/implementation/obelisk";
import { EvilTag } from "../../../../../shared/traits/engine/tags/alignment/alignment-tags";

export class RedObeliskBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.totem.obelisk.resource.image, Resources.totem.obelisk.size, DrawPriority.NormalGridElement),
	TSynergy,
	EvilTag,
) {
	castSpeed = 1;
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		if (implementsTrait(gridElement, EvilTag)) return true;
		return false;
	};
	override patternEffect = new PatternEffect(
		[
			new Cell({ x: 1, y: 1 }),
			new Cell({ x: -1, y: 0 }),
			new Cell({ x: 1, y: 0 }),
			new Cell({ x: -1, y: 1 }),
			new Cell({ x: 0, y: 2 }),
		],
		this.patternCondition.bind(this),
	);
	toRecruit(cell: Cell) {
		return new RedObelisk(cell, this);
	}
	description = new Description("Red Obelisk", [
		"every 5 seconds :",
		"destroy a random unit",
		"of yours, if succeed",
		"trigger your furry",
		"",
		"Trigger 10% faster",
		"for each ▣ evil monument",
	]);
}
