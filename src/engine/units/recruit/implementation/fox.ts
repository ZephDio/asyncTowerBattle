import { Derive } from "@ddd-ts/traits";
import { Unit } from "../unit";
import { Cell, GridPosition } from "../../../../shared/position";
import { FoxBlueprint } from "../../blueprint/implementation/fox-blueprint";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleFox } from "../../battle/implementation/battle-fox";

export class Fox extends Derive(RecruitCaster, Unit) {
	constructor(
		public cell: Cell,
		fox: FoxBlueprint = new FoxBlueprint({}),
	) {
		super({
			imageDrawable: fox,
			hitboxHolder: fox,
			descriptor: fox,
			statsHolder: fox,
			tagHolder: fox,
			rarityHolder: fox,
		});
	}

	get position() {
		return this.cell;
	}

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleFox(this, position, path, hooks);
	}
}
