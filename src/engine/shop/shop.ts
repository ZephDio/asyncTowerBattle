import { Cell, Position } from "../../shared/position";
import { Army } from "../army/entity/army";
import { Game } from "../game";
import { AnyTowerRecruit } from "../tower/recruit/tower-recruit";
import { Retail } from "./retail";
import { ShopState } from "../../shared/gamestate";
import { HTImageDrawable, TImageDrawable, TRenderable } from "../../shared/traits/drawable";
import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { AnyTower } from "../tower/entity/tower";
import { AnyPathTile } from "../tile/entity/tile";
import { TDrawable } from "../../shared/traits/tdrawable";
import { AnyBarrackRecruit } from "../barrack/recruit/barrack-recruit";
import { HTHitbox, TCollider } from "../../shared/hitboxes";
import { GoldHud } from "../../shared/hud-element/gold-hud";
import { StartBattleButton } from "../../shared/hud-element/start-battle-button";
import { PtiWrapRanch } from "../grid/inventory/unit-inventory";
import { TTokenDrag } from "./token-drag/token-drag";
import { TGrid } from "../grid/tgrid";
import { AnyRecruitUnit } from "../units/recruit/unit-recruit";
import { BuyableTokenDrag } from "./token-drag/buyable-token-drag";
import { UnitTokenDrag } from "./token-drag/unit-token-drag";
import { ArmyRecruitTokenDrag } from "./token-drag/army-recruit-token-drag";

type ArmyHooks = {
	recruit: (blueprint: AnyTower, tile: Cell) => void;
	isValidDestinationCell: (cell: Cell) => boolean;
	removeRecruit: (recruit: AnyTowerRecruit | AnyBarrackRecruit | AnyPathTile) => void;
	addRecruit: (recruit: AnyTowerRecruit | AnyBarrackRecruit | AnyPathTile) => void;
	getArmyGrid: () => ImplementsTrait<typeof TGrid>;
	addUnit: (unit: AnyRecruitUnit) => void;
};

type ShopHooks = {
	buy: (buyable: Buyable, position: Position) => void;
	addItem: (buyable: Buyable) => void;
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

export class Buyable extends Derive(
	TCollider,
	HTHitbox,
	TDrawable,
	TRenderable,
	TImageDrawable(new Image(), { width: 0, height: 0 }, 0),
	HTImageDrawable,
) {
	drawPriority = 3;
	constructor(
		public entity: AnyTower,
		public position: Position,
		public price: number,
	) {
		super({ imageDrawable: entity, hitboxHolder: entity });
	}

	static from(entity: AnyTower, position: Position, price: number) {
		return new Buyable(entity, position, price);
	}
}

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

	buyTower(buyable: Buyable, position: Position) {
		const cell = this.army.grid.realPositionToGrid(position);
		if (!cell) {
			throw new Error();
		}
		if (!this.army.isValidDestinationCell(cell)) {
			throw new Error();
		}
		this.economyHooks.spendGold(buyable.price);
		this.retail.removeItem(buyable);
		this.army.recruit(buyable.entity, cell);
	}

	buy(buyable: Buyable, position: Position) {
		if (this.economyHooks.getEconomy().gold < buyable.price) {
			throw new Error();
		}
		this.buyTower(buyable, position);
	}

	setHoldFromRetail(buyable: Buyable, position: Position) {
		this.retail.removeItem(buyable);
		const token = new BuyableTokenDrag(buyable, position, this.getTokenHooks());
		this.setHold(token);
	}

	setHoldFromUnitInventory(unit: PtiWrapRanch, position: Position) {
		this.army.unitInventory.deleteElement(unit);
		const token = new UnitTokenDrag(unit, position, this.getTokenHooks());
		this.setHold(token);
	}

	setHoldFromArmyRecruit(recruit: AnyPathTile | AnyTowerRecruit | AnyBarrackRecruit, position: Position) {
		this.army.removeRecruit(recruit);
		const token = new ArmyRecruitTokenDrag(recruit, position, this.getTokenHooks());
		this.setHold(token);
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
			grids: [this.army.grid, this.army.unitInventory],
			drawables: [
				new StartBattleButton({}),
				new GoldHud(this.economyHooks.getEconomy().gold),
				this.retail,
				...this.retail.buyables.keys(),
				...(this.hold ? [this.hold] : []),
			],
		};
	}

	getTokenHooks(): TokenHooks {
		return {
			economyHooks: this.economyHooks,
			armyHooks: {
				recruit: this.army.recruit.bind(this.army),
				isValidDestinationCell: this.army.isValidDestinationCell.bind(this.army),
				removeRecruit: this.army.removeRecruit.bind(this.army),
				addRecruit: this.army.addRecruit.bind(this.army),
				getArmyGrid: () => this.army.grid,
				addUnit: this.army.unitInventory.addUnit.bind(this.army.unitInventory),
			},
			shopHooks: {
				buy: this.buy.bind(this),
				addItem: this.retail.addItem.bind(this.retail),
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
