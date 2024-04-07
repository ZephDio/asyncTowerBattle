import { Trait } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { Soldier } from "./implementation/soldier-recruit";
import { Dragon } from "./implementation/dragon-recruit";
import { AnyBattleUnit } from "../battle/battle-unit";

export type AnyUnit = Soldier | Dragon;

export const Unit = Trait((base) => {
	abstract class IUnit extends base {
		abstract maxLife: number;
		abstract speed: number;
		abstract hitbox: HitBox;
		abstract attackSpeed: number;
		abstract attackDamage: number;
		abstract cost: number;

		abstract toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks): AnyBattleUnit;
	}
	return IUnit;
});
