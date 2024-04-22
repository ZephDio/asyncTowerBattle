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
import { GridShape } from "../../../../shared/traits/engine/core/grid-element";
export class YellowTower extends Derive(HTDamageDealer, Tower, HTSynergy) {
	attackSpeed = 0.8;
	override gridShape: GridShape = new GridShape([new Cell({ x: 0, y: 0 }), new Cell({ x: -1, y: 0 })]);

	constructor(
		public cell: Cell,
		public tower: YellowTowerBlueprint = new YellowTowerBlueprint({}),
	) {
		super({
			synergy: tower,
			damageDealer: tower,
			imageDrawable: tower,
			hitboxHolder: tower,
			descriptor: tower,
			foodConsumer: tower,
		});
	}

	getAreaEffect(hooks: BattleArmyHooks, position: GridPosition, damage: number) {
		return new PoisonGround(80, position, damage, hooks);
	}

	toAllied(_grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const position = this.gridShape.getCenterPosition(this.cell, this.orientation);
		return new YellowBattleTower(this, hooks, position, this.cell, this.orientation);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
		const cell = BattleGrid.flip(grid, this.cell);
		const orientation = this.orientation + Math.PI;
		const position = this.gridShape.getCenterPosition(cell, orientation);
		return new YellowBattleTower(this, hooks, position, cell, orientation);
	}

	get position() {
		return this.gridShape.getCenterPosition(this.cell, this.orientation);
	}
}
