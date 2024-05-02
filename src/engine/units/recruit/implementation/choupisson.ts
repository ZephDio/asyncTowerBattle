import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Unit } from "../unit";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { ChoupissonBlueprint } from "../../blueprint/implementation/choupisson-blueprint";
import { BattleChoupisson } from "../../battle/implementation/battle-choupisson";
export class Choupisson extends Derive(HTDamageDealer, Unit) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(
		public cell: Cell,
		blueprint: ChoupissonBlueprint = new ChoupissonBlueprint({}),
	) {
		super({
			imageDrawable: blueprint,
			damageDealer: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			foodConsumer: blueprint,
		});
		this.maxLife = blueprint.baseMaxLife;
		this.speed = blueprint.baseSpeed;
		this.attackSpeed = blueprint.attackSpeed;
		this.cost = blueprint.cost;
	}

	get position() {
		return this.cell;
	}
	type = "dragon" as const;

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleChoupisson(this, position, path, hooks);
	}
}
