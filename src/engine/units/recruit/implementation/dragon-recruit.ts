import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleDragon } from "../../battle/implementation/dragon-battle";
import { Dragon } from "../../entity/implementation/dragon";
import { UnitRecruit } from "../unit-recruit";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";

export class DragonRecruit extends Derive(HTHitbox, HTDamageDealer, UnitRecruit, HTImageDrawable) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	constructor(dragon: Dragon) {
		super({ imageDrawable: dragon, damageDealer: dragon, hitboxHolder: dragon });
		this.maxLife = dragon.baseMaxLife;
		this.speed = dragon.baseSpeed;
		this.attackSpeed = dragon.attackSpeed;
	}
	type = "dragon" as const;

	toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDragon(this, position, path, hooks);
	}
}
