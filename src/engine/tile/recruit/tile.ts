import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyBattleTile } from "../battle/battle-tile";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { BattleGrid } from "../../grid/battle-grid";
import { TGrid } from "../../grid/tgrid";
import { TPathConnections } from "../path-shape";

export const PathTile = Subtrait([TRecruit, TPathConnections], (base) => {
	abstract class IPathTile extends base {
		// Pair of directions this tile connects when it has 3 or 4 neighbors. Set by right-clicking in the shop.
		connectionChoice: Cell[] | null = null;

		get position() {
			return this.cell;
		}
		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTile;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTile;

		moveRecruit(
			hooks: TokenHooks,
			gridPosition: GridPosition,
			orientation: number,
			grid?: ImplementsTrait<typeof TGrid>,
		) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				throw new Error("cannot sell tile");
			}
			const cell = grid.gridPositionToCell(this.gridShape.getDefaultTilePositionFromGridPosition(gridPosition, orientation));
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
				this.connectionChoice = null;
				this.setOrientation(orientation);
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				return elements[0];
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
