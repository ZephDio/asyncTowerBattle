import { Derive } from "@ddd-ts/traits";
import { Unit } from "../unit";
import { HTBaseStats } from "../../../stats/base-stats";
import { Cell, GridPosition } from "../../../../shared/position";
import { BrewmasterBlueprint } from "../../blueprint/implementation/brewmaster-blueprint";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleBrewmaster } from "../../battle/implementation/battle-brewmaster";

export class Brewmaster extends Derive(Unit, HTBaseStats, RecruitCaster) {
	constructor(
		public cell: Cell,
		blueprint: BrewmasterBlueprint = new BrewmasterBlueprint({}),
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
		return new BattleBrewmaster(this, position, path, hooks);
	}
}
