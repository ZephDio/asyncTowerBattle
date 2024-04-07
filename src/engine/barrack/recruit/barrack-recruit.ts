import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyUnit } from "../../units/recruit/unit-recruit";
import { AnyBattleBarrack } from "../battle/battle-barrack";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/recruit";
import { TokenHooks } from "../../shop/shop";
import { RetailGrid } from "../../grid/retail-grid";
import { Position } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";

export type AnyBarrack = ImplementsTrait<typeof Barrack>;

export const Barrack = Subtrait([TRecruit], (base) => {
	abstract class IBarrack extends base {
		abstract productionSpeed: number;
		abstract unitRecruit: null | AnyUnit;

		setUnit(unit: AnyUnit) {
			this.unitRecruit = unit;
		}

		abstract toAllied(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;
		abstract toEnemy(grid: BattleGrid, path: BattlePath, hooks: BattleArmyHooks): AnyBattleBarrack | undefined;

		moveRecruit(hooks: TokenHooks, position: Position) {
			const grid = hooks.shopHooks.determinateGrid(position);
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.economyHooks.addGold(Math.round(10));
				if (this.unitRecruit) {
					hooks.armyHooks.pushToInventory(this.unitRecruit);
				}
				return;
			}
			const cell = grid.realPositionToGrid(position);
			if (!cell) throw new Error("Invalid cell");
			const element = grid.getElement(cell);
			if (grid instanceof ArmyGrid || grid instanceof Inventory) {
				if (element) throw new Error("already occupied cell");
				this.cell = cell.clone();
				hooks.armyHooks.addRecruit(this, grid);
				return;
			}
			throw new Error("No Case Matched");
		}
	}
	return IBarrack;
});
