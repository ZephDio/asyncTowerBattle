import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleTotem } from "../battle-totem";
import { CornField } from "../../recruit/implementation/corn-field";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattleCornField extends Derive(BattleTotem, BattleStartTrigger) {
	constructor(
		public cornField: CornField,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			tagHolder: cornField,
			rarityHolder: cornField,
			imageDrawable: cornField,
			hitboxHolder: cornField,
			battleStartRecruit: cornField,
			descriptor: cornField,
		});
		this.gridShape = cornField.gridShape;
	}

	onBattleStart() {
		this.hooks.alliedFoodHooks.addMaxFood(this.cornField.blueprint.maxFood);
		let hasTriggered = false;
		this.hooks.onEnemyCastleHit(() => {
			if (hasTriggered) return;
			hasTriggered = true;
			this.hooks.alliedArmyBuffHooks.addUnitBuff("movement-speed", this.cornField.blueprint.speedStacks);
		});
	}

	tick() {}
}
