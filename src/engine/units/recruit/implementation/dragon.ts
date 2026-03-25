import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleDragon } from "../../battle/implementation/battle-dragon";
import { DragonBlueprint } from "../../blueprint/implementation/dragon-blueprint";
import { Unit } from "../unit";
export class Dragon extends Derive(Unit) {
	constructor(
		public cell: Cell,
		dragon: DragonBlueprint = new DragonBlueprint({}),
	) {
		super({
			imageDrawable: dragon,
			hitboxHolder: dragon,
			descriptor: dragon,
			statsHolder: dragon,
			tagHolder: dragon,
		});
	}

	get position() {
		return this.cell;
	}
	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDragon(this, position, path, hooks);
	}
}
