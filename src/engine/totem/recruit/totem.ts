import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattleGrid } from "../../grid/battle-grid";
import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { GridPosition } from "../../../shared/position";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { TGrid } from "../../grid/tgrid";
import { AnyBattleTotem } from "../battle/battle-totem";
import { TotemTag } from "../../../shared/traits/engine/tags/building/building-tags";

export const Totem = Subtrait([TRecruit, TotemTag], (base) => {
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
				return undefined;
			}
			const cell = grid.gridPositionToCell(
				this.gridShape.getDefaultTilePositionFromGridPosition(gridPosition, orientation),
			);
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
	return ITotem;
});

export type AnyTotem = ImplementsTrait<typeof Totem>;
