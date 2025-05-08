import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Unit } from "../unit";
import { ChoupissonBlueprint } from "../../blueprint/implementation/choupisson-blueprint";
import { BattleChoupisson } from "../../battle/implementation/battle-choupisson";
import { HTBaseStats } from "../../../stats/base-stats";

export class Choupisson extends Derive(Unit, HTBaseStats) {
	constructor(
		public cell: Cell,
		blueprint: ChoupissonBlueprint = new ChoupissonBlueprint({}),
	) {
		super({
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			statsHolder: blueprint,
		});
	}

	get position() {
		return this.cell;
	}

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleChoupisson(this, position, path, hooks);
	}
}
