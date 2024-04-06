import { implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { AnyBarrack, Barrack } from "../barrack/recruit/barrack-recruit";
import { CastleBlueprint } from "../castle/blueprint/castle";
import { Castle } from "../castle/recruit/castle-recruit";
import { ArmyGrid } from "../grid/grid";
import { PtiWrapRanch, UnitInventory } from "../grid/inventory/unit-inventory";
import { ArmyPath } from "../path/army/path";
import { AnyPathTile, PathTile } from "../tile/blueprint/tile";
import { AnyTower, Tower } from "../tower/recruit/tower-recruit";
import { AnyUnit } from "../units/recruit/unit-recruit";

export class Army {
	constructor(
		public castle: Castle<CastleBlueprint>,
		public towers: AnyTower[],
		public path: ArmyPath,
		public grid: ArmyGrid,
		public barracks: AnyBarrack[],
		public unitRecruits: AnyUnit[],
		public unitInventory: UnitInventory,
	) {}

	getRecruits() {
		return [...this.towers, ...this.barracks, ...this.path.tiles];
	}

	// recruit(blueprint: AnyTower | AnyUnit | AnyBarrack, tile: Cell) {
	// 	this.addRecruit(blueprint);
	// }

	isValidDestinationCell(cell: Cell) {
		const cellString = ArmyGrid.posToString(cell);
		return !this.grid.tiles.has(cellString);
	}

	removeRecruit(recruit: AnyTower | AnyBarrack | AnyPathTile) {
		this.grid.deleteElement(recruit);
		if (implementsTrait(recruit, Tower)) {
			this.towers.splice(this.towers.indexOf(recruit), 1);
			return;
		}
		if (implementsTrait(recruit, PathTile)) {
			this.path.tiles.splice(this.path.tiles.indexOf(recruit), 1);
			return;
		}
		if (implementsTrait(recruit, Barrack)) {
			this.barracks.splice(this.barracks.indexOf(recruit), 1);
			return;
		}
	}

	addRecruit(recruit: AnyTower | AnyBarrack | AnyPathTile | PtiWrapRanch) {
		if (recruit instanceof PtiWrapRanch) {
			this.unitInventory.addUnit(recruit.unit);
			return;
		}
		this.grid.setElement(recruit);
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
	}

	addTower(recruit: AnyTower) {
		this.towers.push(recruit);
	}

	addTile(tile: AnyPathTile) {
		this.path.tiles.push(tile);
	}

	addBarrack(barrack: AnyBarrack) {
		this.barracks.push(barrack);
	}
}
