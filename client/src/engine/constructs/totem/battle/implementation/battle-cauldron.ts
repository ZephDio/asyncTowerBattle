import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleTotem } from "../battle-totem";
import { Cauldron } from "../../recruit/implementation/cauldron";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattleCauldron extends Derive(BattleTotem, BattleStartTrigger) {
	constructor(
		public cauldron: Cauldron,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			tagHolder: cauldron,
			rarityHolder: cauldron,
			imageDrawable: cauldron,
			hitboxHolder: cauldron,
			battleStartRecruit: cauldron,
			descriptor: cauldron,
		});
		this.gridShape = cauldron.gridShape;
	}

	onBattleStart() {
		this.hooks.alliedArmyBuffHooks.addPoisonDamagePercent(this.cauldron.blueprint.poisonDamagePercent);
	}

	tick() {}
}
