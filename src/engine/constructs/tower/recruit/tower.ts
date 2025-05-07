import { AnyBattleTower } from "../battle/battle-tower";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleGrid } from "../../../grid/battle-grid";
import { implementsTrait, ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { TRecruit } from "../../../../shared/traits/engine/recruit";
import { GridPosition } from "../../../../shared/position";
import { RetailGrid } from "../../../grid/retail-grid";
import { ArmyGrid } from "../../../grid/grid";
import { Inventory } from "../../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../../shop/holder/holder";
import { TGrid } from "../../../grid/tgrid";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { HTFoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { TowerTag } from "../../../../shared/traits/engine/tags/building/building-tags";

export const Tower = Subtrait([HTDamageDealer, RecruitCaster, TRecruit, HTFoodConsumer, TowerTag], (base) => {
	abstract class ITower extends base {
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;

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
				this.cell = cell.clone();
				this.setOrientation(orientation);
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				elements.forEach((element) => {
					if (implementsTrait(element, TRecruit)) {
						hooks.shopPhaseHooks.armyHooks.removeRecruit(element);
						hooks.shopPhaseHooks.armyHooks.pushToInventory(element);
						return undefined;
					}
					throw new Error(`Element found in swap ${element}`);
				});
				return elements[0];
			}
			throw new Error("No Case Matched");
		}
	}
	return ITower;
});

export type AnyTower = ImplementsTrait<typeof Tower>;
