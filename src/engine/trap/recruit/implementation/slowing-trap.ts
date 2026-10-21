import { TPathShape } from "../../../tile/path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleSlowingTrap } from "../../battle/implementation/battle-slowing-trap";
import { Trap } from "../trap";
import { SlowingTrapBlueprint } from "../../blueprint/implementation/slowing-trap-blueprint";

export class SlowingTrap extends Derive(Trap, TPathShape(PathResources.slowing)) {
	constructor(
		public cell: Cell,
		public blueprint: SlowingTrapBlueprint = new SlowingTrapBlueprint({}),
	) {
		super({ hitboxHolder: blueprint, imageDrawable: blueprint, descriptor: blueprint, tagHolder: blueprint });
	}

	toBattle(cell: Cell, position: GridPosition, hooks: BattleArmyHooks) {
		return new BattleSlowingTrap(this, cell, position, hooks);
	}
}
