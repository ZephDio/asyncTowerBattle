import { Trait } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { SoldierRecruit } from "./implementation/soldier-recruit";
import { DragonRecruit } from "./implementation/dragon-recruit";
import { AnyBattleUnit } from "../battle/battle-unit";

export type AnyRecruitUnit = SoldierRecruit | DragonRecruit;

export const UnitRecruit = Trait((base) => {
	abstract class IUnitRecruit extends base {
		abstract maxLife: number;
		abstract speed: number;
		abstract hitbox: HitBox;
		abstract attackSpeed: number;
		abstract attackDamage: number;
		abstract cost: number;

		abstract toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks): AnyBattleUnit;
	}
	return IUnitRecruit;
});
