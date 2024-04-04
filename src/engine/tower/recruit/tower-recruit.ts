import { HitBox } from "../../../shared/hitboxes";
import { Cell } from "../../../shared/position";
import { AnyBattleTower } from "../battle/battle-tower";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattleGrid } from "../../grid/battle-grid";
import { BlueTowerRecruit } from "./implementation/blue-tower-recruit";
import { GreenTowerRecruit } from "./implementation/green-tower-recruit";
import { OrangeTowerRecruit } from "./implementation/orange-tower-recruit";
import { Trait } from "@ddd-ts/traits";
import { YellowTowerRecruit } from "./implementation/yellow-tower-recruit";

export const TowerRecruit = Trait((base) => {
	abstract class ITowerRecruit extends base {
		abstract hitbox: HitBox;
		abstract cell: Cell;

		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract clone(): ITowerRecruit;
	}
	return ITowerRecruit;
});

export type AnyTowerRecruit = BlueTowerRecruit | GreenTowerRecruit | OrangeTowerRecruit | YellowTowerRecruit;
