import { Cell, Position } from "../../shared/position";
import { Army } from "../army/army";
import { Game } from "../game";
import { Retail } from "./retail/retail";
import { ShopState } from "../../shared/gamestate";
import { ImplementsTrait } from "@ddd-ts/traits";
import { GoldHud } from "../../shared/hud-element/gold-hud";
import { StartBattleButton } from "../../shared/hud-element/start-battle-button";
import { TGrid } from "../grid/tgrid";
import { AnyUnit } from "../units/recruit/unit-recruit";
import { ArmyGrid } from "../grid/grid";
import { AnyRecruit } from "../../shared/traits/recruit";
import { Buyable } from "./retail/buyable";
import { RefreshBellHud } from "../../shared/hud-element/refresh-bell-hud";
import { Holder } from "./holder/holder";

type ArmyHooks = {
	isValidDestinationCell: (cell: Cell) => boolean;
	removeRecruit: (recruit: AnyRecruit) => void;
	addRecruit: (recruit: AnyRecruit, grid: ImplementsTrait<typeof TGrid>) => void;
	getArmyGrid: () => ArmyGrid;
	pushToInventory: (recruit: AnyRecruit) => void;
	addUnit: (unit: AnyUnit) => void;
};

type RetailHooks = {
	buy: (buyable: Buyable, position: Position) => void;
	addItem: (buyable: Buyable) => void;
	determinateGrid: (position: Position) => ImplementsTrait<typeof TGrid> | undefined;
};

export type ShopPhaseHooks = {
	economyHooks: EconomyHooks;
	armyHooks: ArmyHooks;
	shopHooks: RetailHooks;
};
export type EconomyHooks = {
	getEconomy: () => { gold: number };
	canPurchase: (price: number) => boolean;
	addGold: (amount: number) => void;
	spendGold: (amount: number) => void;
};

export class ShopPhase {
	public retail = new Retail();
	public holderControl = new Holder();
	constructor(
		public army: Army,
		public onShopExit: Game["handleShopQuit"],
		public economyHooks: EconomyHooks,
	) {}

	exitShop() {
		this.holderControl.exit();
		this.onShopExit();
	}

	buy(buyable: Buyable) {
		this.economyHooks.spendGold(buyable.price);
		this.retail.removeItem(buyable);
	}

	refresh() {
		if (this.economyHooks.canPurchase(5)) {
			this.retail.refresh();
			this.economyHooks.spendGold(5);
		}
	}

	selectItemFromRetail(buyable: Buyable, position: Position) {
		this.holderControl.setHoldFromRetail(buyable, this.retail, position, this.getTokenHooks());
	}

	setHoldFromArmyRecruit(recruit: AnyRecruit, position: Position, grid: ImplementsTrait<typeof TGrid>) {
		this.holderControl.setHoldFromArmyRecruit(recruit, this.army, position, this.getTokenHooks(), grid);
	}

	determineGrid(position: Position) {
		const grids = [this.army.grid, this.army.inventory, this.retail.grid];
		for (const grid of grids) {
			const cell = grid.realPositionToGrid(position);
			if (cell) {
				return grid;
			}
		}
		return undefined;
	}

	getDrawables() {
		return {
			grids: [this.army.grid, this.army.inventory, this.retail.grid],
			drawables: [
				new StartBattleButton({}),
				new RefreshBellHud({}),
				new GoldHud(this.economyHooks.getEconomy().gold),
				...(this.holderControl.hold ? [this.holderControl.hold] : []),
			],
		};
	}

	getTokenHooks(): ShopPhaseHooks {
		return {
			economyHooks: this.economyHooks,
			armyHooks: {
				pushToInventory: this.army.pushToInventory.bind(this.army),
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
			hudElements: [new StartBattleButton({}), new RefreshBellHud({})],
			towers: this.army.towers,
			castle: this.army.castle,
			path: this.army.path,
			grid: this.army.grid,
		} as ShopState;
	}
}
