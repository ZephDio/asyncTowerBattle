import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { PatternEffect } from "../../../pattern-effect/pattern-effect";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { Caster, RecruitCaster } from "../../../../shared/traits/engine/cast";
import { GobelinPortal } from "../../recruit/implementation/gobelin-totem-recruit";

export class GobelinPortalBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.totem.gobelinportal.resource.image, Resources.totem.gobelinportal.size, 3),
	TSynergy,
){
	description = new Description("Golbelin Portal", ["On ▣ trigger :","30% chance to", "generate a goblin"]);
	patternCondition = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		if(!gridElement) return false
		return implementsTrait(gridElement, RecruitCaster) || implementsTrait(gridElement, Caster);
	}
	patternEffect= new PatternEffect(
		[	new Cell({ x : 1, y : 1}), 
			new Cell({ x : -1 , y : -1}), 
			new Cell({ x : 1, y : -1}), 
			new Cell({ x : -1, y : 1})
		], this.patternCondition.bind(this));

	toRecruit(cell: Cell) {
		return new GobelinPortal(cell, this);
	}
		projectile = undefined;
}