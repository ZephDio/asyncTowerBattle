import { HTHitbox, TGCollider } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleRocketProjectile } from "../../../projectile/battle/implementation/battle-rocket";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTower } from "../../entity/implementation/blue-tower";
import { TowerRecruit } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";

import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
import { GridElement } from "../../../grid/grid";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";

export class BlueTowerRecruit extends Derive(
	TGCollider,
	HTHitbox,
	HTDamageDealer,
	TowerRecruit,
	HTImageDrawable,
	TRenderable,
	GridElement,
) {
	attackSpeed = 1.2;

	constructor(
		public tower: BlueTower,
		public cell: Cell,
	) {
		super({ imageDrawable: tower, damageDealer: tower, hitboxHolder: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: Position, damage: number) {
		return new BattleRocketProjectile(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const position = grid.cellToReal(clone.cell);
		return new BlueBattleTower(clone, hooks, position, clone.cell);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToReal(cell);
		return new BlueBattleTower(clone, hooks, position, cell);
	}

	clone() {
		return new BlueTowerRecruit(new BlueTower({}), new Cell({ x: this.cell.x, y: this.cell.y }));
	}

	get position(): Cell {
		return this.cell;
	}
}
