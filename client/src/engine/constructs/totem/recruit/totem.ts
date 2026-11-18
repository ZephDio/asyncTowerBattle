import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleGrid } from "../../../grid/battle-grid";
import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TRecruit } from "../../../../shared/traits/engine/recruit";
import { GridPosition } from "../../../../shared/position";
import { RetailGrid } from "../../../grid/retail-grid";
import { ArmyGrid } from "../../../grid/grid";
import { Inventory } from "../../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../../shop/holder/holder";
import { TGrid } from "../../../grid/tgrid";
import { AnyBattleTotem } from "../battle/battle-totem";

export const Totem = Subtrait([TRecruit], (base) => {
	abstract class ITotem extends base {
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTotem;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTotem;

		moveRecruit(hooks: TokenHooks, gridPosition: GridPosition, grid?: ImplementsTrait<typeof TGrid>) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.shopPhaseHooks.economyHooks.addGold(Math.round(10));
				return undefined;
			}
			const cell = grid.gridPositionToCell(this.gridShape.getDefaultTilePositionFromGridPosition(gridPosition));
			if (!cell) throw new Error("Invalid cell");

			if (grid instanceof ArmyGrid || grid instanceof Inventory) {
				const { valid, elements } = grid.validateGridElementPlacement(this, cell);
				if (!valid) throw new Error("Invalid condition");
				return hooks.shopPhaseHooks.armyHooks.placeOver(this, cell, grid, elements);
			}
			throw new Error("No Case Matched");
		}
	}
	return ITotem;
});

export type AnyTotem = ImplementsTrait<typeof Totem>;
