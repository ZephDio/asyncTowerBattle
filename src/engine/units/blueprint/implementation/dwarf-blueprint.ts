import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { seconds } from "../../../../shared/seconds";
import { BattleDwarf } from "../../battle/implementation/battle-dwarf";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";
import { TBaseStats } from "../../../stats/base-stats";
export class DwarfBlueprint extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	RecruitCaster,
	TImageDrawable(Resources.unit.dwarf.resource.image, Resources.unit.dwarf.size, DrawPriority.NormalGridElement),
	TokenUnit,
	TBaseStats({
		health: 14,
		damage: 1.2,
		attackSpeed: seconds(0.3),
		speed: 0.13,
		castSpeed: 4,
		foodConsumption: 0.4,
		foodConsumptionOnCast: NaN,
		summonTime: seconds(1.6),
		range: NaN,
	}),
) {
	description = new UnitDescription("Dwarf", ["A unit that cast", "a healing area", "area around him"], this);

	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDwarf(this, gridPosition, enemyPath, hooks);
	}
}
