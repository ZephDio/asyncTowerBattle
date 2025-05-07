import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../../renderer/resources";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { PowderMagazine } from "../../recruit/implementation/powder-magazine";

export class PowderMagazineBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.totem.anvil.resource.image, Resources.totem.anvil.size, DrawPriority.NormalGridElement),
) {
	toRecruit(cell: Cell) {
		return new PowderMagazine(cell, this);
	}
	description = new Description("Powder Magazine", [
		"Start of battle :",
		"gain 4💠or 4⚔️ for towers",
		"",
		"15 seconds reached :",
		"gain 8💠or 8⚔️ for towers",
	]);
}
