import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Unit } from "../unit";
import { PriestBlueprint } from "../../blueprint/implementation/priest-blueprint";
import { BattlePriest } from "../../battle/implementation/battle-priest";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
export class Priest extends Derive(Unit, RecruitCaster) {
	constructor(
		public cell: Cell,
		priest: PriestBlueprint = new PriestBlueprint({}),
	) {
		super({
			imageDrawable: priest,
			hitboxHolder: priest,
			descriptor: priest,
			statsHolder: priest,
			tagHolder: priest,
		});
	}

	get position() {
		return this.cell;
	}

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattlePriest(this, position, path, hooks);
	}
}
