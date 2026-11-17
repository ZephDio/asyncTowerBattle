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
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { HTBaseStats } from "../../../stats/base-stats";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";
import { HTTargeting } from "../../../../shared/traits/engine/targeting";

export const Tower = Subtrait([RecruitCaster, TRecruit, HTBaseStats, HTTag, HTTargeting], (base) => {
	abstract class ITower extends base {
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;

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
				this.cell = cell.clone();
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
