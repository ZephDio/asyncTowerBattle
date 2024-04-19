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
import { AnyBattleTotem } from "../battle/battle-totem";

export const Totem = Subtrait([TRecruit], (base) => {
	abstract class ITotem extends base {
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTotem;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTotem;

		moveRecruit(
			hooks: TokenHooks,
			gridPosition: GridPosition,
			orientation: number,
			grid?: ImplementsTrait<typeof TGrid>,
		) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.shopPhaseHooks.economyHooks.addGold(Math.round(10));
				return;
			}
			const cell = grid.gridPositionToCell(gridPosition);
			if (!cell) throw new Error("Invalid cell");

			if (grid instanceof ArmyGrid || grid instanceof Inventory) {
				const condition = grid.checkCondition(this, cell, orientation);
				if (!condition) throw new Error("Invalid condition");
				this.cell = cell.clone();
				this.setOrientation(orientation);
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				return;
			}
			throw new Error("No Case Matched");
		}
	}
	return ITotem;
});

export type AnyTotem = ImplementsTrait<typeof Totem>;
