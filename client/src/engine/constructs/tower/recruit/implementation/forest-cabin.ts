import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { BattleSlowingBullet } from "../../../../projectile/battle/implementation/battle-slowing-bullet";
import { BattleForestCabin } from "../../battle/implementation/battle-forest-cabin";
import { ForestCabinBlueprint } from "../../blueprint/implementation/forest-cabin-blueprint";
import { Tower } from "../tower";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { BattleGrid } from "../../../../grid/battle-grid";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { RecruitBattleStart } from "../../../../../shared/traits/engine/battle-start";

export class ForestCabin extends Derive(Tower, HTSynergy, RecruitBattleStart) {
	constructor(
		public cell: Cell,
		public tower: ForestCabinBlueprint = new ForestCabinBlueprint({}),
	) {
		super({
			imageDrawable: tower,
			hitboxHolder: tower,
			descriptor: tower,
			statsHolder: tower,
			tagHolder: tower,
			rarityHolder: tower,
			targeting: tower,
			synergy: tower,
		});
	}

	getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: GridPosition, damage: number) {
		return new BattleSlowingBullet(this.tower.projectile, position.clone(), hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = grid.cellToGrid(this.cell);
		return new BattleForestCabin(this, hooks, position, this.cell, BoardOrientation.Normal);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const position = grid.cellToGrid(cell);
		return new BattleForestCabin(this, hooks, position, cell, BoardOrientation.Mirrored);
	}

	get position(): Cell {
		return this.cell;
	}
}
