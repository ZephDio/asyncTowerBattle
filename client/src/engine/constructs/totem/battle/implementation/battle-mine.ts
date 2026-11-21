import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleTotem } from "../battle-totem";
import { Mine } from "../../recruit/implementation/mine";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattleMine extends Derive(BattleTotem, BattleStartTrigger) {
	constructor(
		public mine: Mine,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			imageDrawable: mine,
			hitboxHolder: mine,
			tagHolder: mine,
			rarityHolder: mine,
			descriptor: mine,
			battleStartRecruit: mine,
		});
		this.gridShape = mine.gridShape;
	}

	// The star is read on the battle board, turned the way this copy faces (mirrored for the enemy).
	onBattleStart() {
		const [star] = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.mine.patternEffect.getRelativeCells(this.orientation),
		);
		if (!this.mine.patternEffect.patternCondition(star)) return;
		this.hooks.alliedArmyBuffHooks.addUnitBuff("vitality", this.mine.blueprint.vitalityStacks);
	}

	tick() {}
}
