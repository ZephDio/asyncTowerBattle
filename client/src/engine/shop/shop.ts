import { OfferSlotSignHud } from "../../shared/hud-element/entity-hud/offer-slot-sign-hud";
import { rarityOdds } from "./retail/rarity-odds";
import { RarityOddsHud } from "../../shared/hud-element/rarity-odds-hud";
import { ReserveSignHud } from "../../shared/hud-element/reserve-sign-hud";
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
import { ScienceHud, besideReserve } from "../../shared/hud-element/science-hud";
import { SciencePanel } from "../../shared/hud-element/science-panel";
import { Science } from "../../shared/traits/engine/science";
import { OfferReservations } from "./retail/offer-reservations";
import { ReservedSignHud } from "../../shared/hud-element/entity-hud/reserved-sign-hud";

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
	// The science scroll kept open by a click on its seal, and the one previewed while its seal is hovered.
	pinnedScience: Science | null = null;
	hoveredScience: Science | null = null;
	private sciencePanels = new Map<Science, SciencePanel>();
	constructor(
		public army: Army,
		public onShopExit: Game["handleShopQuit"],

		public setDescriptionHud: Game["setDescriptionHud"],
		public round: number,
		public life: number,
		runSeed: number,
		reservations = new OfferReservations(),
	) {
		this.retail = new Retail(round, runSeed, () => army.sciences, reservations);
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
		this.retail.sell(buyable);
	}

	toggleReservation(buyable: Buyable) {
		this.retail.toggleReservation(buyable);
	}

	// The offers cannot be redrawn while the player holds one: it has to be placed or put back first.
	refresh() {
		if (this.holderControl.hold) return;
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
			backdrops: [this.getReserveSign()],
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
					drawables: [
						...this.retail.reservedOffers().map((buyable) => new ReservedSignHud(buyable)),
						...(this.retail.held ? [new OfferSlotSignHud(this.retail.held.cell, this.retail.held)] : []),
						...this.retail.soldOffers().map(({ cell, price }) => new OfferSlotSignHud(cell, undefined, price)),
					],
				},
			],
			renderables: [
				new StartBattleButton({}),
				this.sign,
				...(this.signHovered ? [new RarityOddsHud(rarityOdds(this.round), this.sign)] : []),
				new RefreshBellHud(this.bellPressedAt),
				this.getArmyHud(),
				this.getScienceHud(),
				...(this.sciencePanel ? [this.sciencePanel] : []),
				...(network.complete ? [] : [new PathInvalidHud()]),
				...(this.holderControl.hold ? [this.holderControl.hold] : []),
			],
		};
	}

	getReserveSign() {
		const { position, width, height, cellSize } = this.army.inventory;
		return new ReserveSignHud({ gridPosition: position, gridWidth: width, gridHeight: height, cellSize });
	}

	// Built from the army each time, since the grid widens between rounds and the gold changes.
	getArmyHud() {
		return new ArmyHud(this.army, this.round, this.life);
	}

	// Built each time too: the sciences change as pieces that grant one are placed or sold.
	getScienceHud() {
		return new ScienceHud(this.army, besideReserve(this.army.inventory), this.pinnedScience);
	}

	// The scroll shown: the hovered science's, else the pinned one's.
	get sciencePanel(): SciencePanel | null {
		const science = this.hoveredScience ?? this.pinnedScience;
		if (!science) return null;
		let panel = this.sciencePanels.get(science);
		if (!panel) {
			panel = new SciencePanel(science, this.army);
			this.sciencePanels.set(science, panel);
		}
		return panel;
	}

	// A click on a seal pins its scroll, or closes it when it is the pinned one.
	toggleScience(science: Science) {
		this.pinnedScience = this.pinnedScience === science ? null : science;
	}

	closeSciencePanel() {
		this.sciencePanel?.clearHover();
		this.pinnedScience = null;
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
