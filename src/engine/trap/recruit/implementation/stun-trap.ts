import { TPathShape } from "../../../tile/path-shape";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Trap } from "../trap";
import { StunTrapBlueprint } from "../../blueprint/implementation/stun-trap-blueprint";
import { BattleStunTrap } from "../../battle/implementation/battle-stun-trap";

export class StunTrap extends Derive(Trap, TPathShape(PathResources.trap)) {
	constructor(
		public cell: Cell,
		public blueprint: StunTrapBlueprint = new StunTrapBlueprint({}),
	) {
		super({ hitboxHolder: blueprint, imageDrawable: blueprint, descriptor: blueprint, tagHolder: blueprint });
	}

	toBattle(cell: Cell, position: GridPosition, hooks: BattleArmyHooks) {
		return new BattleStunTrap(this, cell, position, hooks);
	}
}
