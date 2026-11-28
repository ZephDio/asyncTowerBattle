import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { hasTag } from "../../../../../shared/traits/engine/tags/tagged";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { CAST_TIME, CasterDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { RedObelisk } from "../../recruit/implementation/obelisk";
import { EvilTag } from "../../../../../shared/traits/engine/tags/alignment/alignment-tags";
import { TBaseStats } from "../../../../stats/base-stats";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class RedObeliskBlueprint extends Derive(
	TRarity(Rarity.Legendary),
	TShopBlueprint(20, 10),
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(TotemResources.obelisk.image, TotemResources.obelisk.size, DrawPriority.NormalGridElement),
	TSynergy,
	EvilTag,
	TotemTag,
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: castSpeedFromSeconds(9),
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
) {
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		if (hasTag(gridElement, "Evil")) return true;
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
	description = new CasterDescription(
		"Red Obelisk",
		[
			`Every ${CAST_TIME} seconds :`,
			"destroy a random unit",
			"of yours, if succeed",
			"trigger your furry",
			"",
			"Trigger 5% faster",
			"for each ▣ evil monument",
		],
		this,
	);
}
