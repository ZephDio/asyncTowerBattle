import { Castle } from "../../castle/entity/castle";
import { CastleRecruit } from "../../castle/recruit/castle-recruit";
import { ArmyPath } from "../../path/entity/path";
import { AnyTowerRecruit, TowerRecruit } from "../../tower/recruit/tower-recruit";
import { Grid } from "../../grid/grid";
import { AnyTower } from "../../tower/entity/tower";
import { Cell } from "../../../shared/position";
import { AnyPathTile, PathTile } from "../../tile/entity/tile";
import { AnyBarrackRecruit, BarrackRecruit } from "../../barrack/recruit/barrack-recruit";
import { implementsTrait } from "@ddd-ts/traits";

export class Army {
	constructor(
		public castle: CastleRecruit<Castle>,
		public towers: AnyTowerRecruit[],
		public path: ArmyPath,
		public grid: Grid,
		public barracks: AnyBarrackRecruit[],
	) {}

	getRecruits() {
		return [...this.towers, ...this.barracks, ...this.path.tiles];
	}

	recruit(blueprint: AnyTower, tile: Cell) {
		const recruit = blueprint.toRecruit(tile);
		this.grid.setElement(recruit);
		this.towers.push(recruit);
	}

	isValidDestinationCell(cell: Cell) {
		const cellString = Grid.posToString(cell);
		return !this.grid.tiles.has(cellString);
	}

	removeRecruit(recruit: AnyTowerRecruit | AnyBarrackRecruit | AnyPathTile) {
		this.grid.deleteElement(recruit);
		if (implementsTrait(recruit, TowerRecruit)) {
			this.towers.splice(this.towers.indexOf(recruit), 1);
			return;
		}
		if (implementsTrait(recruit, PathTile)) {
			this.path.tiles.splice(this.path.tiles.indexOf(recruit), 1);
			return;
		}
		if (implementsTrait(recruit, BarrackRecruit)) {
			this.barracks.splice(this.barracks.indexOf(recruit), 1);
			return;
		}
	}

	addRecruit(recruit: AnyTowerRecruit | AnyBarrackRecruit | AnyPathTile) {
		this.grid.setElement(recruit);
		if (implementsTrait(recruit, TowerRecruit)) {
			this.addTower(recruit);
			return;
		}
		if (implementsTrait(recruit, PathTile)) {
			this.addTile(recruit);
			return;
		}
		if (implementsTrait(recruit, BarrackRecruit)) {
			this.addBarrack(recruit);
			return;
		}
	}

	addTower(recruit: AnyTowerRecruit) {
		this.towers.push(recruit);
	}

	addTile(tile: AnyPathTile) {
		this.path.tiles.push(tile);
	}

	addBarrack(barrack: AnyBarrackRecruit) {
		this.barracks.push(barrack);
	}
}
