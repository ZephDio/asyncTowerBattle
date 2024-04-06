import { HTHitbox, TGCollider } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleRocket } from "../../../projectile/battle/implementation/battle-rocket";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTowerBlueprint } from "../../blueprint/implementation/blue-tower";
import { Tower } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";

import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
import { GridElement } from "../../../grid/grid";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";

export class BlueTower extends Derive(
	TGCollider,
	HTHitbox,
	HTDamageDealer,
	Tower,
	HTImageDrawable,
	TRenderable,
	GridElement,
) {
	attackSpeed = 1.2;

	constructor(
		public tower: BlueTowerBlueprint,
		public cell: Cell,
	) {
		super({ imageDrawable: tower, damageDealer: tower, hitboxHolder: tower });
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: Position, damage: number) {
		return new BattleRocket(this.tower.projectile, position.clone(), hooks, target, damage);
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
		return new BlueTower(new BlueTowerBlueprint({}), new Cell({ x: this.cell.x, y: this.cell.y }));
	}

	get position(): Cell {
		return this.cell;
	}
}
