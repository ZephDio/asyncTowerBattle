import { Cell, GridPosition, ScreenPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Tower } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";

import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { FrostBattleTower } from "../../battle/implementation/frost-battle-tower";
import { FrostTowerBlueprint } from "../../blueprint/implementation/frost-tower";
import { BattleFrostSpike } from "../../../projectile/battle/implementation/battle-frost-spike";

export class FrostTower extends Derive(HTDamageDealer, Tower) {
	attackSpeed = 1.2;

	constructor(
		public cell: Cell,
		public tower = new FrostTowerBlueprint({}),
	) {
		super({ imageDrawable: tower, damageDealer: tower, hitboxHolder: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleFrostSpike(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const position = grid.cellToGrid(clone.cell);
		return new FrostBattleTower(clone, hooks, position, clone.cell);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToGrid(cell);
		return new FrostBattleTower(clone, hooks, position, cell);
	}

	clone() {
		return new FrostTower(this.cell.clone(), this.tower);
	}

	get position(): Cell {
		return this.cell;
	}

	override 	draw(context: CanvasRenderingContext2D, position: ScreenPosition, cellSize: number): void {
				const { width, height } = this.drawable.size;
				const scale = cellSize / 4.9;
				const size = this.getCanvasSize(context, width, height, scale);
				const canvasPosition = this.getCanvasPosition(context, position);
				this.drawImage(context, size, canvasPosition, this.drawable.image, this.angle);
			}
}
