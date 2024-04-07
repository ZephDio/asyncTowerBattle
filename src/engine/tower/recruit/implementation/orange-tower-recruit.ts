import { HTHitbox, TGCollider } from "../../../../shared/hitboxes";
import { Cell } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTowerBlueprint } from "../../blueprint/implementation/orange-tower";
import { Tower } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { HTSynergy } from "../../../../shared/traits/synergy";
import { GridElement } from "../../../grid/grid";

export class OrangeTower extends Derive(
	TGCollider,
	HTHitbox,
	Tower,
	HTSynergy,
	HTImageDrawable,
	TRenderable,
	GridElement,
) {
	constructor(
		public tower: OrangeTowerBlueprint,
		public cell: Cell,
	) {
		super({ synergy: tower, imageDrawable: tower, hitboxHolder: tower });
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const position = grid.cellToReal(clone.cell);
		return new OrangeBattleTower(clone, hooks, position, clone.cell);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const clone = this.clone();
		const cell = BattleGrid.flip(grid, clone.cell);
		const position = grid.cellToReal(cell);
		return new OrangeBattleTower(clone, hooks, position, cell);
	}

	clone(): OrangeTower {
		return new OrangeTower(
			new OrangeTowerBlueprint({}),
			new Cell({
				x: this.cell.x,
				y: this.cell.y,
			}),
		);
	}

	get position(): Cell {
		return this.cell;
	}
}
