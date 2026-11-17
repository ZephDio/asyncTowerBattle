import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Unit } from "../unit";
import { WhiteStagBlueprint } from "../../blueprint/implementation/white-stag-blueprint";
import { BattleWhiteStag } from "../../battle/implementation/battle-white-stag";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
export class WhiteStag extends Derive(Unit, RecruitCaster) {
	constructor(
		public cell: Cell,
		whiteStag: WhiteStagBlueprint = new WhiteStagBlueprint({}),
	) {
		super({
			imageDrawable: whiteStag,
			hitboxHolder: whiteStag,
			descriptor: whiteStag,
			statsHolder: whiteStag,
			tagHolder: whiteStag,
			rarityHolder: whiteStag,
		});
	}

	get position() {
		return this.cell;
	}

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleWhiteStag(this, position, path, hooks);
	}
}
