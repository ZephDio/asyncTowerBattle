import { Trait } from "@ddd-ts/traits";
import { HitBox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { BattleDragon } from "../battle/implementation/dragon-battle";
import { BattleSoldier } from "../battle/implementation/soldier-battle";

export type AnyBattleUnit = BattleDragon | BattleSoldier;

export const UnitRecruit = Trait((base) => {
	abstract class IUnitRecruit extends base {
		abstract maxLife: number;
		abstract speed: number;
		abstract hitbox: HitBox;
		abstract attackSpeed: number;
		abstract attackDamage: number;

		abstract toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks): AnyBattleUnit;
	}
	return IUnitRecruit;
});
