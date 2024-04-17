import { Cell, GridPosition, ScreenPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Tower } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";

import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { FrostBattleTower } from "../../battle/implementation/frost-battle-tower";
import { FrostTowerBlueprint } from "../../blueprint/implementation/frost-tower";
import { BattleFrostSpike } from "../../../projectile/battle/implementation/battle-frost-spike";
import { STANDARD_CELL_SIZE } from "../../../grid/tgrid";
export class FrostTower extends Derive(HTDamageDealer, Tower) {
	attackSpeed = 1.2;

	constructor(
		public cell: Cell,
		public tower = new FrostTowerBlueprint({}),
	) {
		super({ imageDrawable: tower, damageDealer: tower, hitboxHolder: tower, descriptor: tower });
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

	override draw(context: CanvasRenderingContext2D, position: ScreenPosition, cellSize: number): void {
		const { width, height } = this.drawable.size;
		const scale = cellSize / STANDARD_CELL_SIZE;
		const size = this.getCanvasSize(context, width, height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, size, canvasPosition, this.drawable.image, this.angle);
	}
}
