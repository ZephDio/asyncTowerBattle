import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyUnit } from "../../units/recruit/unit-recruit";
import { AnyBattleBarrack } from "../battle/battle-barrack";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { RetailGrid } from "../../grid/retail-grid";
import { GridPosition } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { TGrid } from "../../grid/tgrid";

export type AnyBarrack = ImplementsTrait<typeof Barrack>;

export const Barrack = Subtrait([TRecruit], (base) => {
	abstract class IBarrack extends base {
		abstract productionSpeed: number;
		abstract unitRecruit: null | AnyUnit;

		setUnit(unit: AnyUnit | null) {
			this.unitRecruit = unit;
		}

		abstract toAllied(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;
		abstract toEnemy(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;

		moveRecruit(hooks: TokenHooks, position: GridPosition, grid?: ImplementsTrait<typeof TGrid>) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.shopPhaseHooks.economyHooks.addGold(Math.round(10));
				if (this.unitRecruit) {
					hooks.shopPhaseHooks.armyHooks.pushToInventory(this.unitRecruit);
				}
				return;
			}
			const cell = grid.gridPositionToCell(position);
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
	return IBarrack;
});
