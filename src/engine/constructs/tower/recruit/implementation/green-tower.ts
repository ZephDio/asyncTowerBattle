import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { BattleBullet } from "../../../../projectile/battle/implementation/battle-bullet";
import { GreenBattleTower } from "../../battle/implementation/battle-green-tower";
import { GreenTowerBlueprint } from "../../blueprint/implementation/green-tower-blueprint";
import { Tower } from "../tower";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { BattleGrid } from "../../../../grid/battle-grid";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class GreenTower extends Derive(Tower) {
	constructor(
		public cell: Cell,
		public tower: GreenTowerBlueprint = new GreenTowerBlueprint({}),
	) {
		super({
			imageDrawable: tower,
			hitboxHolder: tower,
			descriptor: tower,
			statsHolder: tower,
			tagHolder: tower,
		});
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleBullet(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = grid.cellToGrid(this.cell);
		return new GreenBattleTower(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new GreenBattleTower(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position(): Cell {
		return this.cell;
	}
}
