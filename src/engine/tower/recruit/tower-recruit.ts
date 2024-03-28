import { HitBox } from "../../../shared/hitboxes";
import { GridPosition, Position } from "../../../shared/position";
import { Recruit } from "../../../shared/physic";
import { BattleTower } from "../battle/battle-tower";
import { AnyTower } from "../entity/tower";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { Grid } from "../../grid/grid";
import { BattleGrid } from "../../grid/battle-grid";
import { BlueTowerRecruit } from "./implementation/blue-tower-recruit";
import { GreenTowerRecruit } from "./implementation/green-tower-recruit";
import { OrangeTowerRecruit } from "./implementation/orange-tower-recruit";

export abstract class TowerRecruit<T extends AnyTower = AnyTower> implements Recruit {
	abstract type: T["type"];
	abstract hitbox: HitBox;
	abstract attackSpeed: number;
	abstract attackDamage: number;
	abstract gridPosition: GridPosition;
	abstract tower: T;

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

export type AnyTowerRecruit = BlueTowerRecruit | GreenTowerRecruit | OrangeTowerRecruit;

export interface SerializedTowerRecruit {
	type: AnyTower["type"];
	gridPosition: GridPosition;
	position: Position;
}
