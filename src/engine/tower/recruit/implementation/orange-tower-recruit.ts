import { HitBox } from "../../../../shared/hitboxes";
import { Cell } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTower } from "../../entity/implementation/orange-tower";
import { TowerRecruit } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { HTSynergy } from "../../../../shared/traits/synergy";
import { GridElement } from "../../../grid/grid";

export class OrangeTowerRecruit extends Derive(TowerRecruit, HTSynergy, HTImageDrawable, TRenderable, GridElement) {
	hitbox: HitBox;

	constructor(
		public tower: OrangeTower,
		public cell: Cell,
	) {
		super({ synergy: tower, imageDrawable: tower });
		this.hitbox = tower.hitbox;
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

	clone(): OrangeTowerRecruit {
		return new OrangeTowerRecruit(
			new OrangeTower({}),
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
