import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleTotem } from "../battle-totem";
import { Mine } from "../../recruit/implementation/mine";

export class BattleMine extends Derive(BattleTotem) {
	constructor(
		public mine: Mine,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
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
