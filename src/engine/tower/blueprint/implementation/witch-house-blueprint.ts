import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";

import { WitchHouse } from "../../recruit/implementation/witch-house";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { BasicPathTile } from "../../../tile/recruit/implementation/basic-tile";
import { SlowingPathTile } from "../../../tile/recruit/implementation/slowing-tile";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { TDescriptor, TowerDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { PatternEffect } from "../../../pattern-effect/pattern-effect";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { TrapPathTile } from "../../../tile/recruit/implementation/trap-tile";

export class WitchHouseBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 10 }), new GridPosition({ x: 0, y: 0 })]])),
	TDamageDealer(6),
	TDescriptor,
	FoodConsumer,
	TImageDrawable(Resources.tower.yellow.resource.image, Resources.tower.yellow.size, DrawPriority.NormalGridElement),
	TSynergy,
) {
	foodCost = 5;

	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		return gridElement
			? gridElement instanceof BasicPathTile ||
					gridElement instanceof SlowingPathTile ||
					gridElement instanceof TrapPathTile
			: false;
	};
	patternEffect = new PatternEffect(
		[new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 }), new Cell({ x: 1, y: 0 })],
		this.patternCondition.bind(this),
	);
	description = new TowerDescription(
		"Poison Sentinel",
		["This tower make", "some poison puddles", "on path around it"],
		{ damage: "6 per tick", range: "5", "cast speed": "0.8", "food consumption": "5" },
	);
	toRecruit(cell: Cell) {
		return new WitchHouse(cell, this);
	}
}
