import { Derive } from "@ddd-ts/traits";
import { DrawPriority, TImageDrawable } from "../../../shared/traits/render/image-drawable";
import { Resources } from "../../../renderer/resources";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../shared/position";
import { Description, TDescriptor } from "../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../stats/base-stats";

export class ElfCastleBlueprint extends Derive(
	TImageDrawable(Resources.castle.elf.resource.image, Resources.castle.elf.size, DrawPriority.NormalGridElement),
	TDescriptor,
	THitbox(new HitBox([[new Rectangle({ width: 5, height: 5 }), new GridPosition({ x: 0, y: 0 })]])),
	TBaseStats({
		health: 20,
		damage: NaN,
		castSpeed: 1,
		attackSpeed: NaN,
		speed: NaN,
		foodConsumption: NaN,
		foodConsumptionOnCast: NaN,
		summonTime: NaN,
		range: NaN,
	}),
) {
	description = new Description(
		"Castle",
		["A castle that", "you must protect !", "Builds Tower to protect", "yourself and barracks", "to slay your enemies"],
		{
			"food production": "4/second",
			health: "20",
		},
	);
}
