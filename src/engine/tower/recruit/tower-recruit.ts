import { AnyBattleTower } from "../battle/battle-tower";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattleGrid } from "../../grid/battle-grid";
import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TRecruit } from "../../../shared/traits/recruit";
import { Position } from "../../../shared/position";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";

export const Tower = Subtrait([TRecruit], (base) => {
	abstract class ITower extends base {
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract clone(): ITower;

		moveRecruit(hooks: TokenHooks, position: Position) {
			const grid = hooks.shopPhaseHooks.shopHooks.determinateGrid(position);
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.shopPhaseHooks.economyHooks.addGold(Math.round(10));
				return;
			}
			const cell = grid.realPositionToGrid(position);
			if (!cell) throw new Error("Invalid cell");
			const element = grid.getElement(cell);
			if (grid instanceof ArmyGrid || grid instanceof Inventory) {
				if (element) throw new Error("already occupied cell");
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
