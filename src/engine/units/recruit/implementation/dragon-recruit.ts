import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleDragon } from "../../battle/implementation/dragon-battle";
import { DragonBlueprint } from "../../blueprint/implementation/dragon";
import { Unit } from "../unit-recruit";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";

export class Dragon extends Derive(HTHitbox, HTDamageDealer, Unit, HTImageDrawable) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(dragon: DragonBlueprint) {
		super({ imageDrawable: dragon, damageDealer: dragon, hitboxHolder: dragon });
		this.maxLife = dragon.baseMaxLife;
		this.speed = dragon.baseSpeed;
		this.attackSpeed = dragon.attackSpeed;
		this.cost = dragon.cost;
	}
	type = "dragon" as const;

	toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDragon(this, position, path, hooks);
	}
}
