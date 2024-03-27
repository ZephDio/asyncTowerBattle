import { HitBox } from "../../../shared/hitboxes";
import { Recruit } from "../../../shared/physic";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/entity/path";
import { BattleUnit } from "../battle/entity-units-physic";
import { Unit } from "../entity/units";

export abstract class UnitRecruit<U extends Unit> implements Recruit {
	abstract maxLife: number;
	abstract speed: number;
	abstract type: U["type"];
	abstract hitbox: HitBox;
	abstract attackSpeed: number;
	abstract attackDamage: number;

	abstract toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks): BattleUnit<UnitRecruit<Unit>>;
}
