import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleFrog } from "../../battle/implementation/battle-frog";
import { FrogBlueprint } from "../../blueprint/implementation/frog-blueprint";
import { Unit } from "../unit";

export class Frog extends Derive(Unit) {
	constructor(
		public cell: Cell,
		public blueprint: FrogBlueprint = new FrogBlueprint({}),
	) {
		super({
			imageDrawable: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			statsHolder: blueprint,
			tagHolder: blueprint,
			rarityHolder: blueprint,
		});
	}

	get position() {
		return this.cell;
	}

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleFrog(this, position, path, hooks);
	}
}
