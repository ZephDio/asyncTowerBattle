import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { Unit } from "../units/recruit/unit";
import { AnyRecruit, TRecruit } from "../../shared/traits/engine/recruit";
import { TGrid } from "../grid/tgrid";
import { BattlePath } from "../path/battle/battle-path";
import { ArmyFoodEconomy } from "../food/food-economy";
import { ArmyGoldEconomy, EconomyHooks } from "../gold/army-gold-economy";
import { ShopEnterTrigger } from "../../shared/traits/engine/shop-enter";
import { GridElement } from "../../shared/traits/engine/core/grid-element";

export type ArmyHooks = {
	economyHooks: EconomyHooks;
	getRelativeNeighborsInGrid: (gridPosition: Cell, relativePositions: Cell[]) => ImplementsTrait<typeof GridElement>[];
};

export class Army {
	constructor(
		public grid: ArmyGrid,
		public inventory: Inventory,

		public foodEconomy = new ArmyFoodEconomy(),
		public goldEconomy = new ArmyGoldEconomy(),
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

	addToInventory(recruit: AnyRecruit) {
		this.inventory.setElement(recruit);
	}

	addToGrid(recruit: AnyRecruit) {
		this.grid.setElement(recruit);
	}

	getEconomyHooks() {
		return this.goldEconomy.getHooks();
	}

	onShopeEnter() {
		const hooks = this.getHooks();
		this.grid.getElements().forEach((element) => {
			if (implementsTrait(element, ShopEnterTrigger)) {
				element.onShopEnter(hooks);
			}
		});
	}

	getHooks(): ArmyHooks {
		return {
			economyHooks: this.getEconomyHooks(),
			getRelativeNeighborsInGrid: this.grid.getRelativeNeighborsInGrid.bind(this.grid),
		};
	}
}
