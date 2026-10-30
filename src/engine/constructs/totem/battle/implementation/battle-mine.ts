import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleTotem } from "../battle-totem";
import { Mine } from "../../recruit/implementation/mine";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattleMine extends Derive(BattleTotem) {
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
			descriptor: mine,
		});
		this.gridShape = mine.gridShape;
	}

	tick() {}
}
