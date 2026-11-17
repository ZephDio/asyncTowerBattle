import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleParadiseBird } from "../../battle/implementation/battle-paradise-bird";
import { ParadiseBirdBlueprint } from "../../blueprint/implementation/paradise-bird-blueprint";
import { Unit } from "../unit";
export class ParadiseBird extends Derive(Unit) {
	constructor(
		public cell: Cell,
		paradiseBird: ParadiseBirdBlueprint = new ParadiseBirdBlueprint({}),
	) {
		super({
			imageDrawable: paradiseBird,
			hitboxHolder: paradiseBird,
			descriptor: paradiseBird,
			statsHolder: paradiseBird,
			tagHolder: paradiseBird,
			rarityHolder: paradiseBird,
		});
	}

	get position() {
		return this.cell;
	}
	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleParadiseBird(this, position, path, hooks);
	}
}
