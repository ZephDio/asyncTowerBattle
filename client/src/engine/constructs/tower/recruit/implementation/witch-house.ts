import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Tower } from "../tower";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { HTGrantsScience } from "../../../../../shared/traits/engine/science";
import { WitchHouseBlueprint } from "../../blueprint/implementation/witch-house-blueprint";

import { PoisonGround } from "../../../../area-effect/implementation/poison-ground";
import { GridShape } from "../../../../../shared/traits/engine/core/grid-element";
import { BattleWitchHouse } from "../../battle/implementation/battle-witch-house";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
export class WitchHouse extends Derive(Tower, HTGrantsScience) {
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: 0, y: 1 })]);
	constructor(
		public cell: Cell,
		public tower: WitchHouseBlueprint = new WitchHouseBlueprint({}),
	) {
		super({
			imageDrawable: tower,
			hitboxHolder: tower,
			descriptor: tower,
			statsHolder: tower,
			tagHolder: tower,
			rarityHolder: tower,
			targeting: tower,
			scienceHolder: tower,
		});
	}

	getAreaEffect(hooks: BattleArmyHooks, position: GridPosition, damage: number) {
		const poisonPercent = hooks.alliedArmyBuffHooks.getPoisonDamagePercent();
		return new PoisonGround(80, position, damage * (1 + poisonPercent / 100), hooks);
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = this.gridShape.getCenterPosition(this.cell);
		return new BattleWitchHouse(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = this.gridShape.getCenterPosition(cell, BoardOrientation.Mirrored);
		return new BattleWitchHouse(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell);
	}
}
