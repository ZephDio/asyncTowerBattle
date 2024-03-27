import { HitBox } from "../../../shared/hitboxes";
import { GridPosition, Position } from "../../../shared/position";
import { PhysicEntity, Recruit } from "../../../shared/physic";
import { BattleProjectile } from "../../projectile/battle/battle-projectile";
import { Projectile } from "../../projectile/entity/projectile";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { BattleTower } from "../battle/battle-tower";
import { AnyTower } from "../entity/tower";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { Grid } from "../../grid/grid";
import { BattleGrid } from "../../grid/battle-grid";

export abstract class TowerRecruit<T extends AnyTower = AnyTower> implements Recruit {
	abstract type: T["type"];
	abstract hitbox: HitBox;
	abstract attackSpeed: number;
	abstract attackDamage: number;
	abstract gridPosition: GridPosition;
	abstract tower: T;

	doesTargetMatchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 62 * 62;
	}

	abstract getProjectile(
		hooks: BattleArmyHooks,
		target: PhysicEntity<Recruit>,
		position: Position,
		damage: number,
	): BattleProjectile<Projectile>;

	abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower;
	abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower;
	abstract clone(): TowerRecruit<T>;

	toSerialized(grid: Grid): SerializedTowerRecruit {
		return {
			type: this.type,
			gridPosition: this.gridPosition,
			position: grid.gridPositionToReal(this.gridPosition),
		};
	}
}

export interface SerializedTowerRecruit {
	type: "orange" | "blue" | "green";
	gridPosition: GridPosition;
	position: Position;
}
