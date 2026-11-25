import { rarityOdds } from "./retail/rarity-odds";
import { RarityOddsHud } from "../../shared/hud-element/rarity-odds-hud";
import { ShopSignHud } from "../../shared/hud-element/shop-sign-hud";
import { Cell, ScreenPosition } from "../../shared/position";
import { Army } from "../army/army";
import { Game } from "../game";
import { Retail } from "./retail/retail";
import { ShopState } from "../../shared/gamestate";
import { ImplementsTrait } from "@ddd-ts/traits";
import { StartBattleButton } from "../../shared/hud-element/start-battle-button";
import { TGrid } from "../grid/tgrid";
import { AnyUnit } from "../units/recruit/unit";
import { ArmyGrid } from "../grid/grid";
import { AnyRecruit } from "../../shared/traits/engine/recruit";
import { Buyable } from "./retail/buyable";
import { RefreshBellHud } from "../../shared/hud-element/refresh-bell-hud";
import { Holder } from "./holder/holder";
import { EconomyHooks } from "../gold/army-gold-economy";
import { PathPreview } from "../path/army/path-preview";
import { PathInvalidHud } from "../../shared/hud-element/path-invalid-hud";
import { ArmyHud } from "../../shared/hud-element/army-hud";
import { ScienceHud } from "../../shared/hud-element/science-hud";

type ArmyHooks = {
	isValidDestinationCell: (cell: Cell) => boolean;
	removeRecruit: (recruit: AnyRecruit) => void;
	addRecruit: (recruit: AnyRecruit, grid: ImplementsTrait<typeof TGrid>) => void;
	getArmyGrid: () => ArmyGrid;
	pushToInventory: (recruit: AnyRecruit) => void;
	hasInventoryRoomFor: (recruit: AnyRecruit) => boolean;
	placeOver: (
		recruit: AnyRecruit,
		cell: Cell,
		grid: ImplementsTrait<typeof TGrid>,
		elements: AnyRecruit[],
	) => AnyRecruit | undefined;
	addUnit: (unit: AnyUnit) => void;
};

type RetailHooks = {
	buy: (buyable: Buyable) => void;
	addItem: (buyable: Buyable) => void;
	determinateGrid: (position: ScreenPosition) => ImplementsTrait<typeof TGrid> | undefined;
};

export type ShopPhaseHooks = {
	economyHooks: EconomyHooks;
	armyHooks: ArmyHooks;
	shopHooks: RetailHooks;
};

export class ShopPhase {
	readonly sign = new ShopSignHud({});
	signHovered = false;
	public retail: Retail;
	public holderControl = new Holder();
	// When the refresh bell was last pressed, for its press animation
	bellPressedAt: number | null = null;
	economyHooks: EconomyHooks;
	constructor(
		public army: Army,
		public onShopExit: Game["handleShopQuit"],

		public setDescriptionHud: Game["setDescriptionHud"],
		public round: number,
		public life: number,
		runSeed: number,
	) {
		this.retail = new Retail(round, runSeed, () => army.sciences);
		this.economyHooks = army.getEconomyHooks();
	}

	exitShop() {
		// The battle needs a door-to-castle path; the shop shows "Path invalid" until there is one.
		if (!this.army.pathNetwork.complete) return;
		this.holderControl.exit();
		// A swapped-out recruit with no room in the inventory is still in hand.
		if (this.holderControl.hold) return;
		this.onShopExit();
	}

	buy(buyable: Buyable) {
		this.economyHooks.spendGold(buyable.price);
		this.retail.removeItem(buyable);
	}

	refresh() {
		this.bellPressedAt = performance.now();
		if (this.economyHooks.canPurchase(5)) {
			this.retail.refresh();
			this.economyHooks.spendGold(5);
		}
	}

	selectItemFromRetail(buyable: Buyable, position: ScreenPosition) {
		this.holderControl.setHoldFromRetail(buyable, this.retail, position, this.getTokenHooks());
	}

	setHoldFromArmyRecruit(recruit: AnyRecruit, position: ScreenPosition, grid: ImplementsTrait<typeof TGrid>) {
		this.holderControl.setHoldFromArmyRecruit(recruit, this.army, position, this.getTokenHooks(), grid);
	}

	determineGrid(position: ScreenPosition) {
		const grids = [this.army.grid, this.army.inventory, this.retail.grid];
		for (const grid of grids) {
			const gridPosition = grid.screenToGridPosition(position);
			const cell = grid.gridPositionToCell(gridPosition);
			if (cell) {
				return grid;
			}
		}
		return undefined;
	}

	getDrawables() {
		const network = this.army.pathNetwork;
		return {
			grids: [
				{
					grid: this.army.grid,
					drawables: [this.getPathPreview(network)],
				},
				{
					grid: this.army.inventory,
					drawables: [],
				},
				{
					grid: this.retail.grid,
					drawables: [],
				},
			],
			renderables: [
				new StartBattleButton({}),
				this.sign,
				...(this.signHovered ? [new RarityOddsHud(rarityOdds(this.round), this.sign)] : []),
				new RefreshBellHud(this.bellPressedAt),
				this.getArmyHud(),
				this.getScienceHud(),
				...(network.complete ? [] : [new PathInvalidHud()]),
				...(this.holderControl.hold ? [this.holderControl.hold] : []),
			],
		};
	}

	// Built from the army each time, since the grid widens between rounds and the gold changes.
	getArmyHud() {
		return new ArmyHud(this.army, this.round, this.life);
	}

	// Built each time too: the sciences change as pieces that grant one are placed or sold.
	getScienceHud() {
		return new ScienceHud(this.army, this.army.inventory);
	}

	getPathPreview(network = this.army.pathNetwork) {
		this.army.refreshPathConnections(network);
		return new PathPreview(network.junctions);
	}

	getTokenHooks(): ShopPhaseHooks {
		return {
			economyHooks: this.economyHooks,
			armyHooks: {
				pushToInventory: this.army.pushToInventory.bind(this.army),
				hasInventoryRoomFor: this.army.hasInventoryRoomFor.bind(this.army),
				placeOver: this.army.placeOver.bind(this.army),
				isValidDestinationCell: this.army.isValidDestinationCell.bind(this.army),
				removeRecruit: this.army.removeRecruit.bind(this.army),
				addRecruit: this.army.addRecruit.bind(this.army),
				getArmyGrid: () => this.army.grid,
				addUnit: this.army.inventory.add.bind(this.army.inventory),
			},
			shopHooks: {
				buy: this.buy.bind(this),
				addItem: this.retail.addItem.bind(this.retail),
				determinateGrid: this.determineGrid.bind(this),
			},
		};
	}

	getState() {
		return {
			type: "shop",
			retail: this.retail,
			hold: this.holderControl.hold,
			hudElements: [new StartBattleButton({}), new RefreshBellHud(), this.getArmyHud(), this.getScienceHud()],
			towers: this.army.towers,
			castle: this.army.castle,
			grid: this.army.grid,
			path: this.army.isPathValid(),
			inventory: this.army.inventory,
		} as ShopState;
	}
}
