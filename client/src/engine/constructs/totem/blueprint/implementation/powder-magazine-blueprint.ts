import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { Description, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { PowderMagazine } from "../../recruit/implementation/powder-magazine";
import { TotemResources } from "../../../../../renderer/resources/totem.resources";
import { TotemTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class PowderMagazineBlueprint extends Derive(
	TRarity(Rarity.Uncommon),
	TShopBlueprint(15, 10),
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(
		TotemResources.powderMagazine.image,
		TotemResources.powderMagazine.size,
		DrawPriority.NormalGridElement,
	),
	TotemTag,
) {
	toRecruit(cell: Cell) {
		return new PowderMagazine(cell, this);
	}
	// Tower projectile-damage stacks (🏹) given at the start of battle.
	readonly startDamageStacks = 4;
	// Seconds into the battle when it gives its tower cast-speed stacks (🔮).
	readonly lateTriggerSeconds = 15;
	readonly lateCastSpeedStacks = 5;

	description = new Description("Powder Magazine", [
		"Start of battle,",
		`towers get ${this.startDamageStacks} 🏹`,
		"",
		`After ${this.lateTriggerSeconds} seconds,`,
		`towers get ${this.lateCastSpeedStacks} 🔮`,
	]);
}
