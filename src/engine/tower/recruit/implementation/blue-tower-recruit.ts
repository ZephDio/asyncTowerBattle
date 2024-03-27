import { HitBox } from "../../../../shared/hitboxes";
import { GridPosition, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../../shared/physic";
import { BattleRocketProjectile } from "../../../projectile/battle/implementation/rocket-projectile-bullet";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTower } from "../../entity/implementation/blue-tower";
import { TowerRecruit } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { BattleTower } from "../../battle/battle-tower";

export class BlueTowerRecruit extends TowerRecruit<BlueTower> {
	attackDamage = 7;
	attackSpeed = 1.2;
	type = "blue" as const;
	hitbox: HitBox;

	constructor(
		public tower: BlueTower,
		public gridPosition: GridPosition,
	) {
		super();
		this.hitbox = tower.hitbox;
	}

	getProjectile(hooks: BattleArmyHooks, target: PhysicEntity<Recruit>, position: Position, damage: number) {
		return new BattleRocketProjectile(this.tower.projectile, { x: position.x, y: position.y }, hooks, target, damage);
	}

	toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower<TowerRecruit<BlueTower>> {
		const clone = this.clone();
		const position = grid.gridPositionToReal(clone.gridPosition);
		return new BlueBattleTower(clone, position, clone.gridPosition, hooks);
	}

	toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower<TowerRecruit<BlueTower>> {
		const clone = this.clone();
		const gridPosition = BattleGrid.flip(grid, clone.gridPosition);
		const position = grid.gridPositionToReal(gridPosition);
		return new BlueBattleTower(clone, position, gridPosition, hooks);
	}

	clone() {
		return new BlueTowerRecruit(new BlueTower(), { gridX: this.gridPosition.gridX, gridY: this.gridPosition.gridY });
	}
}
