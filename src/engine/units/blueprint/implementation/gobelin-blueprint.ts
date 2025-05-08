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
import { BattleGobelin } from "../../battle/implementation/battle-gobelin";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { seconds } from "../../../../shared/seconds";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";
import { TBaseStats } from "../../../stats/base-stats";

export class GobelinBlueprint extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	RecruitCaster,
	TImageDrawable(Resources.unit.gobelin.resource.image, Resources.unit.gobelin.size, DrawPriority.NormalGridElement),
	TokenUnit,
	TBaseStats({
		health: 10,
		damage: 1,
		speed: 0.4,
		attackSpeed: seconds(0.3),
		castSpeed: 4,
		foodConsumption: 1,
		foodConsumptionOnCast: NaN,
		summonTime: seconds(1),
		range: NaN,
	}),
) {
	override description = new UnitDescription("Gobelin", ["A small and fast creature"], this);

	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleGobelin(this, gridPosition, enemyPath, hooks);
	}
}
