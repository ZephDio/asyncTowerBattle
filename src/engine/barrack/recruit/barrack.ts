import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyUnit } from "../../units/recruit/unit";
import { AnyBattleBarrack } from "../battle/battle-barrack";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { RetailGrid } from "../../grid/retail-grid";
import { GridPosition } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { TGrid } from "../../grid/tgrid";
import { RecruitCaster } from "../../../shared/traits/engine/cast";
import { BarrackTag } from "../../../shared/traits/engine/tags";

export type AnyBarrack = ImplementsTrait<typeof Barrack>;

export const Barrack = Subtrait([TRecruit, RecruitCaster, BarrackTag], (base) => {
	abstract class IBarrack extends base {
		abstract productionSpeed: number;
		abstract unitRecruit: null | AnyUnit;

		setUnit(unit: AnyUnit | null) {
			this.unitRecruit = unit;
		}

		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleBarrack;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleBarrack;

		moveRecruit(hooks: TokenHooks, position: GridPosition, orientation: number, grid?: ImplementsTrait<typeof TGrid>) {
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
			if (grid instanceof ArmyGrid || grid instanceof Inventory) {
				const { valid, elements } = grid.validateGridElementPlacement(this, cell, orientation);
				if (!valid) throw new Error("Invalid condition");
				elements.forEach((element) => {
					if (implementsTrait(element, TRecruit)) {
						hooks.shopPhaseHooks.armyHooks.removeRecruit(element);
						hooks.shopPhaseHooks.armyHooks.pushToInventory(element);
						return undefined;
					}
					throw new Error(`Element found in swap ${element}`);
				});
				this.cell = cell.clone();
				this.setOrientation(orientation);
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				return elements[0];
			}
			throw new Error("No Case Matched");
		}
	}
	return IBarrack;
});
