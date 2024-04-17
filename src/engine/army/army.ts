import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { Unit } from "../units/recruit/unit-recruit";
import { AnyRecruit, TRecruit } from "../../shared/traits/engine/recruit";
import { TGrid } from "../grid/tgrid";
import { BattlePath } from "../path/battle/battle-path";

export class Army {
	constructor(
		//public path: ArmyPath,
		public grid: ArmyGrid,
		public inventory: Inventory,
	) {}

	isValidDestinationCell(cell: Cell) {
		const cellString = ArmyGrid.posToString(cell);
		return !this.grid.tiles.has(cellString);
	}

	removeRecruit(recruit: AnyRecruit) {
		this.inventory.deleteElement(recruit);
		this.grid.deleteElement(recruit);
	}

	addRecruit(recruit: AnyRecruit, grid: ImplementsTrait<typeof TGrid>) {
		if (grid instanceof ArmyGrid) {
			if (implementsTrait(recruit, Unit)) {
				throw new Error("Cannot add unit to army grid");
			}
			if (implementsTrait(recruit, TRecruit)) {
				this.addToGrid(recruit);
				return;
			}
			return;
		}
		if (grid instanceof Inventory) {
			this.addToInventory(recruit);
			return;
		}
		throw new Error("Invalid grid type");
	}

	get totems() {
		return this.grid.totems;
	}
	get castle() {
		return this.grid.castle;
	}
	get towers() {
		return this.grid.towers;
	}
	get barracks() {
		return this.grid.barracks;
	}

	get pathTiles() {
		return this.grid.pathTiles;
	}

	get environment() {
		return this.grid.environment;
	}

	get path() {
		const from = this.grid.getEnemyDoorCell();
		const to = this.castle.cell.down();
		return BattlePath.chainTiles(from, to, this.pathTiles);
	}

	isPathValid() {
		try {
			return this.path;
		} catch (e) {
			return null;
		}
	}

	pushToInventory(recruit: AnyRecruit) {
		this.inventory.add(recruit);
	}

	// addTower(recruit: AnyTower) {
	// 	this.grid.setElement(recruit);
	// }

	addToInventory(recruit: AnyRecruit) {
		this.inventory.setElement(recruit);
	}

	addToGrid(recruit: AnyRecruit) {
		this.grid.setElement(recruit);
	}

	// addBarrack(barrack: AnyBarrack) {
	// 	this.grid.setElement(barrack);
	// }
}
