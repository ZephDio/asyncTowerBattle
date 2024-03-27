import { HitBox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/entity/path";
import { BattleDragon } from "../../battle/implementation/dragon-battle";
import { Dragon } from "../../entity/implementation/dragon";
import { UnitRecruit } from "../unit-recruit";

export class DragonRecruit extends UnitRecruit<Dragon> {
	hitbox: HitBox;
	speed: number;
	maxLife: number;
	attackSpeed: number;
	attackDamage: number;
	constructor(dragon: Dragon) {
		super();
		this.hitbox = dragon.hitbox;
		this.maxLife = dragon.baseMaxLife;
		this.speed = dragon.baseSpeed;
		this.attackSpeed = dragon.attackSpeed;
		this.attackDamage = dragon.attackDamage;
	}
	type = "dragon" as const;

	toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDragon(this, position, path, hooks);
	}
}
