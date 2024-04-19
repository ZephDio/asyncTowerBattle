import { Derive } from "@ddd-ts/traits";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { Unit } from "../unit-recruit";
import { BersekerBlueprint } from "../../blueprint/implementation/berseker";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleBerseker } from "../../battle/implementation/battle-berseker";

export class Berseker extends Derive(Unit, HTDamageDealer) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(
		public cell: Cell,
		berseker: BersekerBlueprint = new BersekerBlueprint({}),
	) {
		super({
			imageDrawable: berseker,
			damageDealer: berseker,
			hitboxHolder: berseker,
			descriptor: berseker,
			foodConsumer: berseker,
		});
		this.maxLife = berseker.baseMaxLife;
		this.speed = berseker.baseSpeed;
		this.attackSpeed = berseker.attackSpeed;
		this.cost = berseker.cost;
	}

	get position() {
		return this.cell;
	}
	type = "berseker" as const;

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleBerseker(this, position, path, hooks);
	}
}
