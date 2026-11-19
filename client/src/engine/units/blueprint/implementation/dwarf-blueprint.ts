import { Rarity, TRarity } from "../../../../shared/traits/engine/rarity";
import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { secondsToFrame } from "../../../../shared/seconds";
import { BattleDwarf } from "../../battle/implementation/battle-dwarf";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { KinfolkTag } from "../../../../shared/traits/engine/tags/species/species-tag";
export class DwarfBlueprint extends Derive(
	TRarity(Rarity.Common),
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	RecruitCaster,
	TImageDrawable(UnitResources.dwarf.image, UnitResources.dwarf.size, DrawPriority.NormalGridElement),
	TokenUnit,
	TBaseStats({
		health: 14,
		damage: 1.2,
		attackSpeed: secondsToFrame(0.3),
		speed: 2,
		castSpeed: NaN,
		foodConsumption: 0.4,
		foodConsumptionOnCast: NaN,
		summonTime: secondsToFrame(1.6),
		range: NaN,
	}),
	KinfolkTag,
) {
	description = new UnitDescription("Dwarf", ["A unit that spawn", "with a stone shield"], this);

	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDwarf(this, gridPosition, enemyPath, hooks);
	}
}
