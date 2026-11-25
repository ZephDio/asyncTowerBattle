import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { Science, TRequiresScience } from "../../../../../shared/traits/engine/science";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";
import { EvilTag } from "../../../../../shared/traits/engine/tags/alignment/alignment-tags";
import { Cauldron } from "../../recruit/implementation/cauldron";

export class CauldronBlueprint extends Derive(
	TRarity(Rarity.Epic),
	TShopBlueprint(30, 10),
	TRequiresScience(Science.Witchcraft),
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(TotemResources.cauldron.image, TotemResources.cauldron.size, DrawPriority.NormalGridElement),
	TotemTag,
	EvilTag,
) {
	// Percent added to the damage of the army's poison effects, each Cauldron adding its own.
	readonly poisonDamagePercent = 20;

	description = new Description("Cauldron", ["Poison effect damage", `+${this.poisonDamagePercent}%`]);

	toRecruit(cell: Cell) {
		return new Cauldron(cell, this);
	}
}
