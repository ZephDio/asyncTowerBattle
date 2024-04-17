import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { OrangeTower } from "../../recruit/implementation/orange-tower-recruit";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { PatternEffect } from "../../../pattern-effect/pattern-effect";

export class OrangeTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.tower.orange.resource.image, Resources.tower.orange.size, 3),
	TSynergy,
) {
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		return gridElement ? implementsTrait(gridElement, HTDamageDealer) : false;
	};
	patternEffect = new PatternEffect(
		[new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })],
		this.patternCondition.bind(this),
	);
	toRecruit(cell: Cell) {
		return new OrangeTower(cell, this);
	}
	description = new Description("Boost Tower", ["A tower that boosts", "damage of nearby", "towers by 30%"]);
	projectile = undefined;
}
