import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { AnvilTotem } from "../../recruit/implementation/anvil";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { PatternEffect } from "../../../pattern-effect/pattern-effect";

export class AnvilTotemBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.totem.anvil.resource.image, Resources.totem.anvil.size, DrawPriority.NormalGridElement),
	TSynergy,
) {
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		return gridElement ? implementsTrait(gridElement, HTDamageDealer) : false;
	};
	patternEffect = new PatternEffect(
		[new Cell({ x: 1, y: 0 }), new Cell({ x: -1, y: 0 })],
		this.patternCondition.bind(this),
	);
	toRecruit(cell: Cell) {
		return new AnvilTotem(cell, this);
	}
	description = new Description("Forging Anvil", ["A totem that boosts", "damage of ▣ towers", "by 30%"]);
	projectile = undefined;
}
