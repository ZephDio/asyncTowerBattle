import { Rarity, TRarity } from "../../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../../shared/position";
import { HitBox } from "../../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../../shared/traits/engine/core/THitbox";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack";
import { TShopBlueprint } from "../../../../../shared/traits/engine/shop-blueprint";
import { BarrackDescription, TDescriptor } from "../../../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../../../stats/base-stats";
import { BarrackResources } from "../../../../../renderer/resources/barrack.resources";
import { BarrackTag } from "../../../../../shared/traits/engine/tags/building/building-tags";

export class WaveBarrackBlueprint extends Derive(
	TRarity(Rarity.Uncommon),
	TShopBlueprint(10, 10),
	TDescriptor,
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(BarrackResources.wave.image, BarrackResources.wave.size, DrawPriority.NormalGridElement),
	TBaseStats({
		health: NaN,
		damage: NaN,
		castSpeed: 1,
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: 3,
		summonTime: NaN,
		range: NaN,
	}),
	BarrackTag,
) {
	description = new BarrackDescription("Wave Barrack", ["A barrack that", "spawn unit 3 by 3"], this);

	toRecruit(cell: Cell) {
		return new WaveBarrack(cell.clone(), this);
	}
}
