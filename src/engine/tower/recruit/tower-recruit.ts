import { HitBox } from "../../../shared/hitboxes";
import { Cell } from "../../../shared/position";
import { AnyBattleTower } from "../battle/battle-tower";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattleGrid } from "../../grid/battle-grid";
import { BlueTower } from "./implementation/blue-tower-recruit";
import { GreenTower } from "./implementation/green-tower-recruit";
import { OrangeTower } from "./implementation/orange-tower-recruit";
import { Trait } from "@ddd-ts/traits";
import { YellowTower } from "./implementation/yellow-tower-recruit";

export const Tower = Trait((base) => {
	abstract class ITower extends base {
		abstract hitbox: HitBox;
		abstract cell: Cell;

		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract clone(): ITower;
	}
	return ITower;
});

export type AnyTower = BlueTower | GreenTower | OrangeTower | YellowTower;
