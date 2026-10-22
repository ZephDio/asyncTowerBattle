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
import { STANDARD_CELL_SIZE, TGrid } from "../../grid/tgrid";
import { DEFAULT_PATH_CONNECTIONS, TPathConnections } from "../path-shape";
import { TTrapHolder } from "../../../shared/traits/engine/trap-holder";
import { AnyTrap } from "../../trap/recruit/trap";

export const PathTile = Subtrait([TRecruit, TPathConnections, TTrapHolder], (base) => {
	abstract class IPathTile extends base {
		// Pair of directions this tile connects when it has 3 or 4 neighbors. Set by right-clicking in the shop.
		connectionChoice: Cell[] | null = null;
		trap: AnyTrap | null = null;

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
				this.connectionChoice = null;
				this.setOrientation(orientation);
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				return elements[0];
			}
			throw new Error("No Case Matched");
		}

		// Puts the trap on this tile and returns the trap it replaces.
		attachTrap(trap: AnyTrap) {
			const replaced = this.detachTrap();
			this.trap = trap;
			trap.pathTile = this;
			trap.pathConnections = this.pathConnections;
			return replaced;
		}

		detachTrap() {
			const trap = this.trap;
			if (!trap) return null;
			trap.cell = this.cell.clone();
			trap.pathTile = null;
			trap.pathConnections = DEFAULT_PATH_CONNECTIONS;
			this.trap = null;
			return trap;
		}

		// The trap answers in the middle half of the tile's area; the outer half reaches the tile, like a barrack and
		// its unit.
		trapAt(gridPosition: GridPosition, grid: ImplementsTrait<typeof TGrid>) {
			if (!this.trap) return null;
			const center = grid.cellToGrid(this.cell);
			const halfSide = STANDARD_CELL_SIZE / (2 * Math.SQRT2);
			const onTrap = Math.abs(gridPosition.x - center.x) <= halfSide && Math.abs(gridPosition.y - center.y) <= halfSide;
			return onTrap ? this.trap : null;
		}

		// The trap follows the tile's straight or turn shape.
		setPathConnections(connections: Cell[]) {
			this.pathConnections = connections;
			if (this.trap) this.trap.pathConnections = connections;
		}

		toHash() {
			return this.cell.toHash() + this.constructor.name;
		}
	}
	return IPathTile;
});

export type AnyPathTile = ImplementsTrait<typeof PathTile>;
