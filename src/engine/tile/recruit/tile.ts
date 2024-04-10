import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyBattleTile } from "../battle/battle-tile";
import { TRecruit } from "../../../shared/traits/recruit";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { BattleGrid } from "../../grid/battle-grid";
import { TGrid } from "../../grid/tgrid";

export const PathTile = Subtrait([TRecruit], (base) => {
	abstract class IPathTile extends base {
		get position() {
			return this.cell;
		}
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTile;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTile;

		moveRecruit(hooks: TokenHooks, gridPosition: GridPosition, grid?: ImplementsTrait<typeof TGrid>) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				throw new Error("cannot sell tile");
			}
			const cell = grid.gridPositionToCell(gridPosition);
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

		toHash() {
			return this.cell.toHash() + this.constructor.name;
		}
	}
	return IPathTile;
});

export type AnyPathTile = ImplementsTrait<typeof PathTile>;
