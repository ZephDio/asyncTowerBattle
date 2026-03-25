import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Unit } from "../unit";
import { EntBlueprint } from "../../blueprint/implementation/ent-blueprint";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleEnt } from "../../battle/implementation/battle-ent";

export class Ent extends Derive(Unit, RecruitCaster) {
	constructor(
		public cell: Cell,
		blueprint: EntBlueprint = new EntBlueprint({}),
	) {
		super({
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			statsHolder: blueprint,
			tagHolder: blueprint,
		});
	}

	get position() {
		return this.cell;
	}

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleEnt(this, position, path, hooks);
	}
}
