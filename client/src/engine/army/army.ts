import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { Unit } from "../units/recruit/unit";
import { AnyRecruit, TRecruit } from "../../shared/traits/engine/recruit";
import { TGrid } from "../grid/tgrid";
import { PathNetwork } from "../path/army/path-network";
import { ArmyFoodEconomy } from "../food/food-economy";
import { ArmyGoldEconomy, EconomyHooks } from "../gold/army-gold-economy";
import { ShopEnterTrigger } from "../../shared/traits/engine/shop-enter";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { TokenUnit } from "../../shared/traits/engine/token-unit";
import { PathTile } from "../tile/recruit/tile";
import { DEFAULT_PATH_CONNECTIONS } from "../tile/path-shape";
import { AnyTrap, Trap } from "../trap/recruit/trap";
import { sciencesGrantedBy } from "../../shared/traits/engine/science";
import { Barrack } from "../constructs/barrack/recruit/barrack";

export type ArmyHooks = {
	economyHooks: EconomyHooks;
	getRelativeNeighborsInGrid: (gridPosition: Cell, relativePositions: Cell[]) => ImplementsTrait<typeof GridElement>[];
};

export class Army {
	constructor(
		public grid: ArmyGrid,
		public inventory: Inventory,
		public defaultUnit: ImplementsTrait<typeof TokenUnit>,

		public foodEconomy = new ArmyFoodEconomy(),
		public goldEconomy = new ArmyGoldEconomy(),
	) {}

	isValidDestinationCell(cell: Cell) {
		const cellString = ArmyGrid.posToString(cell);
		return !this.grid.tiles.has(cellString);
	}

	removeRecruit(recruit: AnyRecruit) {
		// A picked-up tile has no neighbors any more, so it shows as a plain straight while dragged.
		if (implementsTrait(recruit, PathTile)) recruit.setPathConnections(DEFAULT_PATH_CONNECTIONS);
		if (implementsTrait(recruit, Trap)) recruit.pathTile?.detachTrap();
		this.inventory.deleteElement(recruit);
		this.grid.deleteElement(recruit);
	}

	addRecruit(recruit: AnyRecruit, grid: ImplementsTrait<typeof TGrid>) {
		if (implementsTrait(recruit, Trap)) {
			this.addTrap(recruit, grid);
			return;
		}
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

	// A trap goes on the path tile of its cell, or alone in the inventory.
	addTrap(trap: AnyTrap, grid: ImplementsTrait<typeof TGrid>) {
		const pathTile = grid.getElement(trap.cell);
		if (pathTile && implementsTrait(pathTile, PathTile)) {
			pathTile.attachTrap(trap);
			return;
		}
		if (grid instanceof Inventory) {
			this.addToInventory(trap);
			return;
		}
		throw new Error("A trap goes on a path tile");
	}

	get totems() {
		return this.grid.totems;
	}
	get castle() {
		return this.grid.castle;
	}
	// Derived from the owned pieces, so nothing is stored: the castle and any grid piece that grants one.
	get sciences() {
		return sciencesGrantedBy([this.castle, ...this.grid.getElements()]);
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

	// Door-to-castle path made by the tiles' connections. See PathNetwork.
	get pathNetwork() {
		return new PathNetwork(this.grid.getEnemyDoorCell(), this.grid.getCastleEntryCell(), this.pathTiles);
	}

	get path() {
		const network = this.pathNetwork;
		if (!network.complete) throw new Error("No path found");
		return network.route;
	}

	// Connected tiles from the enemy door, even when the path does not reach the castle yet.
	get partialPath() {
		return this.pathNetwork.route;
	}

	get pathJunctions() {
		return this.pathNetwork.junctions;
	}

	// Gives every path tile its straight or turn shape.
	refreshPathConnections(network = this.pathNetwork) {
		this.pathTiles.forEach((tile) => tile.setPathConnections(network.connectionsAt(tile.cell)));
	}

	// Right-click on a path tile: turns the junction it is, or the junction next to it, to its next connection.
	cyclePathAt(cell: Cell) {
		const change = this.pathNetwork.nextChoiceAt(cell);
		if (!change) return;
		const tile = this.pathTiles.find((pathTile) => pathTile.cell.equals(change.cell));
		if (tile) tile.connectionChoice = change.choice.map((offset) => offset.clone());
	}

	isPathValid() {
		try {
			return this.path;
		} catch (e) {
			return null;
		}
	}

	// Puts the recruit on the cell over the elements it covers: the first one is returned for the hand and the others
	// go to the inventory. When the inventory has no room for them, nothing moves and this throws.
	placeOver(recruit: AnyRecruit, cell: Cell, grid: ImplementsTrait<typeof TGrid>, elements: AnyRecruit[]) {
		const [held, ...stored] = elements;
		const taken = grid instanceof Inventory ? recruit.gridShape.getOccupiedCellsFrom(cell, recruit.orientation) : [];
		if (!this.inventory.hasRoomForAll(stored, elements, taken)) throw new Error("No room in inventory");
		elements.forEach((element) => this.removeRecruit(element));
		recruit.cell = cell.clone();
		this.addRecruit(recruit, grid);
		stored.forEach((element) => this.pushToInventory(element));
		return held;
	}

	hasInventoryRoomFor(recruit: AnyRecruit) {
		return this.inventory.hasRoomFor(recruit);
	}

	pushToInventory(recruit: AnyRecruit) {
		this.join(recruit);
		this.inventory.add(recruit);
	}

	addToInventory(recruit: AnyRecruit) {
		this.join(recruit);
		this.inventory.setElement(recruit);
	}

	addToGrid(recruit: AnyRecruit) {
		this.join(recruit);
		this.grid.setElement(recruit);
	}

	// A barrack shows the basic unit it falls back on when it holds no unit.
	join(recruit: AnyRecruit) {
		if (implementsTrait(recruit, Barrack)) recruit.defaultUnit = this.defaultUnit;
	}

	getEconomyHooks() {
		return this.goldEconomy.getHooks();
	}

	onShopEnter() {
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
