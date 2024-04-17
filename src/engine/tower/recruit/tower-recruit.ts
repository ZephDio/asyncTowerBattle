import { AnyBattleTower } from "../battle/battle-tower";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattleGrid } from "../../grid/battle-grid";
import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { GridPosition } from "../../../shared/position";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { TGrid } from "../../grid/tgrid";

export const Tower = Subtrait([TRecruit], (base) => {
	abstract class ITower extends base {
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract clone(): ITower;

		moveRecruit(hooks: TokenHooks, gridPosition: GridPosition, grid?: ImplementsTrait<typeof TGrid>) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.shopPhaseHooks.economyHooks.addGold(Math.round(10));
				return;
			}
			const cell = grid.gridPositionToCell(gridPosition);
			if (!cell) throw new Error("Invalid cell");
			if (grid instanceof ArmyGrid || grid instanceof Inventory) {
				this.cell = cell.clone();
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				return;
			}
			throw new Error("No Case Matched");
		}
	}
	return ITower;
});

export type AnyTower = ImplementsTrait<typeof Tower>;
