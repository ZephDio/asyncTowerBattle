import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Tower } from "../tower";
import { BattleGrid } from "../../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { FrostBattleTower } from "../../battle/implementation/battle-frost-tower";
import { FrostTowerBlueprint } from "../../blueprint/implementation/frost-tower-blueprint";
import { BattleFrostSpike } from "../../../../projectile/battle/implementation/battle-frost-spike";

export class FrostTower extends Derive(Tower) {
	constructor(
		public cell: Cell,
		public tower = new FrostTowerBlueprint({}),
	) {
		super({
			imageDrawable: tower,
			hitboxHolder: tower,
			descriptor: tower,
			statsHolder: tower,
		});
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleFrostSpike(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = grid.cellToGrid(this.cell);
		return new FrostBattleTower(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		const orientation = this.orientation + Math.PI;
		return new FrostBattleTower(this, hooks, position, cell, orientation);
	}

	get position(): Cell {
		return this.cell;
	}
}
