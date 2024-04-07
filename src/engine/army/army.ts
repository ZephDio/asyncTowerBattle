import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { AnyBarrack, Barrack } from "../barrack/recruit/barrack-recruit";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { ArmyPath } from "../path/army/path";
import { AnyPathTile, PathTile } from "../tile/recruit/tile";
import { AnyTower, Tower } from "../tower/recruit/tower-recruit";
import { Unit } from "../units/recruit/unit-recruit";
import { AnyRecruit } from "../../shared/traits/recruit";
import { Castle } from "../castle/recruit/castle-recruit";
import { TGrid } from "../grid/tgrid";

export class Army {
	constructor(
		public castle: Castle,
		public towers: AnyTower[],
		public path: ArmyPath,
		public barracks: AnyBarrack[],
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
			if (implementsTrait(recruit, Tower)) {
				this.addTower(recruit);
				return;
			}
			if (implementsTrait(recruit, PathTile)) {
				this.addTile(recruit);
				return;
			}
			if (implementsTrait(recruit, Barrack)) {
				this.addBarrack(recruit);
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

	pushToInventory(recruit: AnyRecruit) {
		this.inventory.add(recruit);
	}

	addTower(recruit: AnyTower) {
		this.towers.push(recruit);
		this.grid.setElement(recruit);
	}

	addToInventory(recruit: AnyRecruit) {
		this.inventory.setElement(recruit);
	}

	addTile(tile: AnyPathTile) {
		this.path.tiles.push(tile);
		this.grid.setElement(tile);
	}
	addBarrack(barrack: AnyBarrack) {
		this.barracks.push(barrack);
		this.grid.setElement(barrack);
	}
}
