import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleSoldier } from "../../battle/implementation/soldier-battle";
import { SoldierBlueprint } from "../../blueprint/implementation/soldier";
import { Unit } from "../unit-recruit";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";

export class Soldier extends Derive(HTHitbox, Unit, HTImageDrawable, HTDamageDealer) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(soldier: SoldierBlueprint) {
		super({ imageDrawable: soldier, damageDealer: soldier, hitboxHolder: soldier });
		this.maxLife = soldier.baseMaxLife;
		this.speed = soldier.baseSpeed;
		this.attackSpeed = soldier.attackSpeed;
		this.cost = soldier.cost;
	}
	type = "soldier" as const;

	toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleSoldier(this, position, path, hooks);
	}
}
