import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { secondsToFrame } from "../../../../shared/seconds";
import { BattleElf } from "../../battle/implementation/battle-elf";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { Arrow } from "../../../projectile/blueprint/implementation/arrow";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { KinfolkTag } from "../../../../shared/traits/engine/tags/species/species-tag";

export class ElfBlueprint extends Derive(
	TRarity(Rarity.Common),
	THitbox(new HitBox([[new Rectangle({ width: 2, height: 2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(UnitResources.elf.image, UnitResources.elf.size, DrawPriority.NormalGridElement),
	TokenUnit,
	RecruitCaster,
	TBaseStats({
		health: 10,
		damage: 1,
		speed: 0.32,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: secondsToFrame(0.1),
		foodConsumption: 0.4,
		foodConsumptionOnCast: NaN,
		summonTime: secondsToFrame(1.2),
		range: NaN,
	}),
	KinfolkTag,
) {
	description = new UnitDescription("Elf", ["A lame unit", "that doesn't do", "anything special"], this);

	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleElf(this, gridPosition, enemyPath, hooks);
	}

	getProjectile() {
		return new Arrow();
	}
}
