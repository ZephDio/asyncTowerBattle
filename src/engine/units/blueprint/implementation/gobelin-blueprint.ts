import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleGobelin } from "../../battle/implementation/battle-gobelin";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { secondsToFrame } from "../../../../shared/seconds";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";
import { TBaseStats } from "../../../stats/base-stats";
import { UnitResources } from "../../../../renderer/resources/unit.resources";
import { EvilTag } from "../../../../shared/traits/engine/tags/alignment/alignment-tags";
import { MonsterTag } from "../../../../shared/traits/engine/tags/species/species-tag";

export class GobelinBlueprint extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	RecruitCaster,
	TImageDrawable(UnitResources.gobelin.image, UnitResources.gobelin.size, DrawPriority.NormalGridElement),
	TokenUnit,
	TBaseStats({
		health: 10,
		damage: 1,
		speed: 0.4,
		attackSpeed: secondsToFrame(0.3),
		castSpeed: NaN,
		foodConsumption: 1,
		foodConsumptionOnCast: NaN,
		summonTime: secondsToFrame(1),
		range: NaN,
	}),
	EvilTag,
	MonsterTag,
) {
	override description = new UnitDescription("Gobelin", ["A small and fast creature"], this);

	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleGobelin(this, gridPosition, enemyPath, hooks);
	}
}
