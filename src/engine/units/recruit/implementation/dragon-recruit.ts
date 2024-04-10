import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleDragon } from "../../battle/implementation/dragon-battle";
import { DragonBlueprint } from "../../blueprint/implementation/dragon";
import { Unit } from "../unit-recruit";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
export class Dragon extends Derive(HTDamageDealer, Unit) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(
		public cell: Cell,
		dragon: DragonBlueprint = new DragonBlueprint({}),
	) {
		super({ imageDrawable: dragon, damageDealer: dragon, hitboxHolder: dragon });
		this.maxLife = dragon.baseMaxLife;
		this.speed = dragon.baseSpeed;
		this.attackSpeed = dragon.attackSpeed;
		this.cost = dragon.cost;
	}

	get position() {
		return this.cell;
	}
	type = "dragon" as const;

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDragon(this, position, path, hooks);
	}
}
