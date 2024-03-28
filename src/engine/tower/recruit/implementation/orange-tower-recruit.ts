import { HitBox } from "../../../../shared/hitboxes";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTower } from "../../entity/implementation/orange-tower";
import { TowerRecruit } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { BattleTower } from "../../battle/battle-tower";

export class OrangeTowerRecruit extends TowerRecruit<OrangeTower> {
	attackDamage = 10;
	attackSpeed = 3;
	type = "orange" as const;
	hitbox: HitBox;

	constructor(
		public tower: OrangeTower,
		public gridPosition: GridPosition,
	) {
		super();
		this.hitbox = tower.hitbox;
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower {
		const clone = this.clone();
		const position = grid.gridPositionToReal(clone.gridPosition);
		return new OrangeBattleTower(clone, position, clone.gridPosition, hooks);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower {
		const clone = this.clone();
		const gridPosition = BattleGrid.flip(grid, clone.gridPosition);
		const position = grid.gridPositionToReal(gridPosition);
		return new OrangeBattleTower(clone, position, gridPosition, hooks);
	}

	clone(): OrangeTowerRecruit {
		return new OrangeTowerRecruit(new OrangeTower(), {
			gridX: this.gridPosition.gridX,
			gridY: this.gridPosition.gridY,
		});
	}
}
