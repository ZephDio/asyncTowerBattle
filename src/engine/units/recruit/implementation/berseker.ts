import { Derive } from "@ddd-ts/traits";
import { Unit } from "../unit";
import { BersekerBlueprint } from "../../blueprint/implementation/berseker-blueprint";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleBerseker } from "../../battle/implementation/battle-berseker";

export class Berseker extends Derive(Unit) {
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
			hitboxHolder: berseker,
			descriptor: berseker,
			statsHolder: berseker,
		});
	}

	get position() {
		return this.cell;
	}
	type = "berseker" as const;

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleBerseker(this, position, path, hooks);
	}
}
