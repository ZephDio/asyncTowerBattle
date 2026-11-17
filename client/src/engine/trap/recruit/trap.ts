import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyRecruit, TRecruit } from "../../../shared/traits/engine/recruit";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { TGrid } from "../../grid/tgrid";
import { TPathConnections } from "../../tile/path-shape";
import { AnyPathTile, PathTile } from "../../tile/recruit/tile";
import { AnyBattleTrap } from "../battle/battle-trap";

// A trap is not a grid element of its own on the army grid: it sits on a path tile, which carries it (see
// PathTile.attachTrap). In the inventory it takes a cell like any recruit.
export const Trap = Subtrait([TRecruit, TPathConnections], (base) => {
	abstract class ITrap extends base {
		// The tile carrying this trap, or null when the trap is alone in the inventory or held.
		pathTile: AnyPathTile | null = null;

		get position() {
			return this.pathTile ? this.pathTile.cell : this.cell;
		}

		abstract toBattle(cell: Cell, position: GridPosition, hooks: BattleArmyHooks): AnyBattleTrap;

		moveRecruit(
			hooks: TokenHooks,
			gridPosition: GridPosition,
			grid?: ImplementsTrait<typeof TGrid>,
		): AnyRecruit | undefined {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				throw new Error("cannot sell trap");
			}
			if (!(grid instanceof ArmyGrid || grid instanceof Inventory)) throw new Error("No Case Matched");
			const cell = grid.gridPositionToCell(this.gridShape.getDefaultTilePositionFromGridPosition(gridPosition));
			if (!cell) throw new Error("Invalid cell");
			const found = grid.getElement(cell);
			if (found && implementsTrait(found, PathTile)) {
				// Dropped on a path tile: the trap it already carries comes back to the hand.
				const replaced = found.trap;
				this.cell = cell.clone();
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				return replaced ?? undefined;
			}
			if (grid instanceof ArmyGrid) throw new Error("A trap goes on a path tile");
			const { valid, elements } = grid.validateGridElementPlacement(this, cell);
			if (!valid) throw new Error("Invalid condition");
			elements.forEach((element) => {
				hooks.shopPhaseHooks.armyHooks.removeRecruit(element);
				hooks.shopPhaseHooks.armyHooks.pushToInventory(element);
			});
			this.cell = cell.clone();
			hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
			return elements[0];
		}

		toHash() {
			return this.cell.toHash() + this.constructor.name;
		}
	}
	return ITrap;
});

export type AnyTrap = ImplementsTrait<typeof Trap>;
