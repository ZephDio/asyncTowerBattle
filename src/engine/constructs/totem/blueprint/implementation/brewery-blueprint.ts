import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../../shared/position";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../../renderer/resources";
import { STANDARD_CELL_SIZE } from "../../../../grid/tgrid";
import { TSynergy } from "../../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../../shared/traits/engine/core/grid-element";
import { Brewery } from "../../recruit/implementation/brewery";
import { Barrack } from "../../../barrack/recruit/barrack";
import { BattleBarrack } from "../../../barrack/battle/battle-barrack";

export class BreweryBlueprint extends Derive(
	TShopBlueprint(15, 5),
	THitbox(new HitBox([[new Rectangle({ width: STANDARD_CELL_SIZE, height: 10 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.totem.brewery.resource.image, Resources.totem.brewery.size, DrawPriority.NormalGridElement),
	TSynergy,
) {
	description = new Description("Cow-boy Brewery", [
		"Every 5 seconds :",
		"produce 0.5🌽 for each",
		"units you control (max 8🌽)",
		"if you hit the max, gain 🥾",
		"",
		"start of battle : gain 🥾",
		"for each ▣ barracks",
	]);

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if (!gridElement) return false;
		return implementsTrait(gridElement, Barrack) || implementsTrait(gridElement, BattleBarrack);
	};
	patternEffect = new PatternEffect(
		[new Cell({ x: 0, y: 1 }), new Cell({ x: 1, y: 0 }), new Cell({ x: 1, y: -1 }), new Cell({ x: 0, y: -2 })],
		this.patternCondition.bind(this),
	);

	toRecruit(cell: Cell) {
		return new Brewery(cell, this);
	}
}
