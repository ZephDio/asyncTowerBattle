import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Unit } from "../unit-recruit";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { PriestBlueprint } from "../../blueprint/implementation/priest";
import { BattlePriest } from "../../battle/implementation/battle-priest";
export class Priest extends Derive(Unit, HTDamageDealer) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(
		public cell: Cell,
		priest: PriestBlueprint = new PriestBlueprint({}),
	) {
		super({ imageDrawable: priest, damageDealer: priest, hitboxHolder: priest, descriptor: priest });
		this.maxLife = priest.baseMaxLife;
		this.speed = priest.baseSpeed;
		this.attackSpeed = priest.attackSpeed;
		this.cost = priest.cost;
	}

	get position() {
		return this.cell;
	}
	type = "priest" as const;

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattlePriest(this, position, path, hooks);
	}
}
