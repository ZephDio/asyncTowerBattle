import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { StunTrap } from "../../recruit/implementation/stun-trap";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { TrapTag } from "../../../../shared/traits/engine/tags/building/building-tags";

export class StunTrapBlueprint extends Derive(
	TRarity(Rarity.Common),
	TShopBlueprint(10, 5),
	TImageDrawable(PathResources.trap.straight, PathResources.trap.size, DrawPriority.CarpetStyleGridElement),
	TDescriptor,
	TrapTag,
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	description = new Description("Stun Trap", ["Place it on a path tile.", "Stuns stepping", "enemies for 2 seconds"]);
	toRecruit(cell: Cell) {
		return new StunTrap(cell, this);
	}
}
