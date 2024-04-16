import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Tower } from "../tower-recruit";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { YellowTowerBlueprint } from "../../blueprint/implementation/yellow-tower";
import { YellowBattleTower } from "../../battle/implementation/battle-yellow-tower";
import { PoisonGround } from "../../../area-effect/implementation/poison-ground";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
export class YellowTower extends Derive(HTDamageDealer, Tower, HTSynergy) {
	attackSpeed = 0.8;

	constructor(
		public cell: Cell,
		public tower: YellowTowerBlueprint = new YellowTowerBlueprint({}),
	) {
		super({ synergy: tower, damageDealer: tower, imageDrawable: tower, hitboxHolder: tower, descriptor: tower });
	}

	getAreaEffect(hooks: BattleArmyHooks, position: GridPosition, damage: number) {
		return new PoisonGround(80, position, damage, hooks);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const position = grid.cellToGrid(clone.cell);
		return new YellowBattleTower(clone, hooks, position, clone.cell);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToGrid(cell);
		return new YellowBattleTower(clone, hooks, position, cell);
	}

	clone() {
		return new YellowTower(this.cell.clone(), this.tower);
	}

	get position(): Cell {
		return this.cell;
	}
}
