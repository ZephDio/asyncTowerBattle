import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../../shared/position";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { VeterantBarrack } from "../../recruit/implementation/veterant-barrack";
import { BarrackDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { BarrackResources } from "../../../../../renderer/resources/barrack.resources";
import { BarrackTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class VeterantBarrackBlueprint extends Derive(
	TRarity(Rarity.Epic),
	TShopBlueprint(10, 6),
	TDescriptor,
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(BarrackResources.veterant.image, BarrackResources.veterant.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		castleDamage: NaN,
		projectileDamage: NaN,
		castSpeed: 0.6,
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
	BarrackTag,
) {
	description = new BarrackDescription(
		"Veterant Barrack",
		["A barrack that spawn", "a giant unit with", "reduced movement", "speed but greatly", "enhanced health"],
		this,
	);

	toRecruit(cell: Cell) {
		return new VeterantBarrack(cell.clone(), this);
	}
}
