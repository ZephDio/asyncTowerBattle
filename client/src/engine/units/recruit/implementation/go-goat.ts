import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleGoGoat } from "../../battle/implementation/battle-go-goat";
import { GoGoatBlueprint } from "../../blueprint/implementation/go-goat-blueprint";
import { Unit } from "../unit";
export class GoGoat extends Derive(Unit) {
	constructor(
		public cell: Cell,
		goGoat: GoGoatBlueprint = new GoGoatBlueprint({}),
	) {
		super({
			imageDrawable: goGoat,
			hitboxHolder: goGoat,
			descriptor: goGoat,
			statsHolder: goGoat,
			tagHolder: goGoat,
			rarityHolder: goGoat,
		});
	}

	get position() {
		return this.cell;
	}
	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleGoGoat(this, position, path, hooks);
	}
}
