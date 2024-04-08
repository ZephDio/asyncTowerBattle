import { Cell, Position } from "../../shared/position";
import { Army } from "../army/army";
import { Game } from "../game";
import { Retail } from "./retail/retail";
import { ShopState } from "../../shared/gamestate";
import { ImplementsTrait } from "@ddd-ts/traits";
import { GoldHud } from "../../shared/hud-element/gold-hud";
import { StartBattleButton } from "../../shared/hud-element/start-battle-button";
import { TTokenDrag } from "./token-drag/token-drag";
import { TGrid } from "../grid/tgrid";
import { AnyUnit } from "../units/recruit/unit-recruit";
import { BuyableTokenDrag } from "./token-drag/buyable-token-drag";
import { RecruitTokenDrag } from "./token-drag/army-recruit-token-drag";
import { ArmyGrid } from "../grid/grid";
import { AnyRecruit } from "../../shared/traits/recruit";
import { Castle } from "../castle/recruit/castle-recruit";
import { Buyable } from "./buyable";

type ArmyHooks = {
	isValidDestinationCell: (cell: Cell) => boolean;
	removeRecruit: (recruit: AnyRecruit) => void;
	addRecruit: (recruit: AnyRecruit, grid: ImplementsTrait<typeof TGrid>) => void;
	getArmyGrid: () => ArmyGrid;
	pushToInventory: (recruit: AnyRecruit) => void;
	addUnit: (unit: AnyUnit) => void;
};

type ShopHooks = {
	buy: (buyable: Buyable, position: Position) => void;
	addItem: (buyable: Buyable) => void;
	determinateGrid: (position: Position) => ImplementsTrait<typeof TGrid> | undefined;
};

export type TokenHooks = {
	economyHooks: EconomyHooks;
	armyHooks: ArmyHooks;
	shopHooks: ShopHooks;
	removeHold: () => void;
};
export type EconomyHooks = {
	getEconomy: () => { gold: number };
	addGold: (amount: number) => void;
	spendGold: (amount: number) => void;
};


export class Shop {
	public hold = null as null | ImplementsTrait<typeof TTokenDrag>;
	public retail = new Retail();
	constructor(
		public army: Army,
		public onShopExit: Game["handleShopQuit"],
		public economyHooks: EconomyHooks,
	) {}

	exitShop() {
		if (this.hold) {
			this.hold.onRelease();
		}
		this.onShopExit();
	}

	buy(buyable: Buyable) {
		this.economyHooks.spendGold(buyable.price);
		this.retail.removeItem(buyable);
	}

	setHoldFromRetail(buyable: Buyable, position: Position) {
		this.retail.removeItem(buyable);
		const onAbort = () => {
			this.retail.addItem(buyable);
			this.hold = null;
		};
		const token = new BuyableTokenDrag(buyable, position, this.getTokenHooks(), onAbort);
		this.setHold(token);
	}

	setHoldFromArmyRecruit(recruit: AnyRecruit, position: Position, grid: ImplementsTrait<typeof TGrid>) {
		if(recruit instanceof Castle) return
		this.army.removeRecruit(recruit);

		const onAbort = () => {
			this.army.addRecruit(recruit, grid);
			this.hold = null;
		};
		const token = new RecruitTokenDrag(recruit, position, this.getTokenHooks(), onAbort);
		this.setHold(token);
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

	moveHold(position: Position) {
		if (this.hold) {
			this.hold.position = position;
		}
	}

	private setHold(token: ImplementsTrait<typeof TTokenDrag>) {
		if (this.hold) {
			this.hold.onRelease();
		}
		this.hold = token;
	}

	getDrawables() {
		return {
			grids: [this.army.grid, this.army.inventory, this.retail.grid],
			drawables: [
				new StartBattleButton({}),
				new GoldHud(this.economyHooks.getEconomy().gold),
				...(this.hold ? [this.hold] : []),
			],
		};
	}

	getTokenHooks(): TokenHooks {
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
			removeHold: () => {
				this.hold = null;
			},
		};
	}

	getState() {
		return {
			type: "shop",
			retail: this.retail,
			hold: this.hold,
			hudElements: [new StartBattleButton({})],
			towers: this.army.towers,
			castle: this.army.castle,
			path: this.army.path,
			grid: this.army.grid,
		} as ShopState;
	}
}
