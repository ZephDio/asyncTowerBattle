import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { Cell, Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { AnyBattleTile } from "../battle/battle-tile";
import { TRecruit } from "../../../shared/traits/recruit";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";

export const PathTile = Subtrait([TRecruit], (base) => {
	abstract class IPathTile extends base {
		get position() {
			return this.cell;
		}
		abstract toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks): AnyBattleTile;

		moveRecruit(hooks: TokenHooks, position: Position) {
			const grid = hooks.shopPhaseHooks.shopHooks.determinateGrid(position);
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				throw new Error("cannot sell tile");
			}
			const cell = grid.realPositionToGrid(position);
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
	return IPathTile;
});

export type AnyPathTile = ImplementsTrait<typeof PathTile>;
