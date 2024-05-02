import { Derive } from "@ddd-ts/traits";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Unit } from "../unit";
import { Cell, GridPosition } from "../../../../shared/position";
import { FoxBlueprint } from "../../blueprint/implementation/fox-blueprint";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleFox } from "../../battle/implementation/battle-fox";

export class Fox extends Derive(HTDamageDealer, RecruitCaster, Unit) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	castSpeed: number;
	constructor(
		public cell: Cell,
		fox: FoxBlueprint = new FoxBlueprint({}),
	) {
		super({ imageDrawable: fox, damageDealer: fox, hitboxHolder: fox, descriptor: fox, foodConsumer: fox });
		this.maxLife = fox.baseMaxLife;
		this.speed = fox.baseSpeed;
		this.attackSpeed = fox.attackSpeed;
		this.cost = fox.cost;
		this.castSpeed = fox.castSpeed;
	}

	get position() {
		return this.cell;
	}

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleFox(this, position, path, hooks);
	}
}
