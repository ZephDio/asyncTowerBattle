import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleSoldier } from "../../battle/implementation/soldier-battle";
import { Soldier } from "../../entity/implementation/soldier";
import { UnitRecruit } from "../unit-recruit";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";

export class SoldierRecruit extends Derive(UnitRecruit, HTImageDrawable, HTDamageDealer) {
	hitbox: HitBox;
	speed: number;
	maxLife: number;
	attackSpeed: number;
	constructor(soldier: Soldier) {
		super({ imageDrawable: soldier, damageDealer: soldier });
		this.hitbox = soldier.hitbox;
		this.maxLife = soldier.baseMaxLife;
		this.speed = soldier.baseSpeed;
		this.attackSpeed = soldier.attackSpeed;
	}
	type = "soldier" as const;

	toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleSoldier(this, position, path, hooks);
	}
}
