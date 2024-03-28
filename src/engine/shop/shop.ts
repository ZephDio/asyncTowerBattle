import { ShopState } from "../../shared/gamestate";
import { StartBattleButton } from "../../shared/hud-element";
import { Position } from "../../shared/position";
import { Army } from "../army/entity/army";
import { Game } from "../game";
import { Recruit } from "../../shared/physic";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { Retail } from "./retail";

export abstract class Buyable<T extends Recruit> {
	abstract type: string;
	abstract entity: T;
	abstract position: Position;
}

export abstract class TowerBuyable extends Buyable<TowerRecruit> {
	public type = "tower" as const;
}

export class Shop {
	public hold = null as null | TowerBuyable;
	public retail = new Retail();
	constructor(
		public army: Army,
		public onShopExit: Game["handleShopQuit"],
	) {}

	exitShop() {
		this.onShopExit();
	}

	buyTower(buyable: TowerBuyable) {
		this.retail.removeItem(buyable);
		buyable.entity.gridPosition = this.army.grid.realPositionToGrid(buyable.position);
		this.army.grid.setElement(buyable.entity);
		this.army.recruit(buyable.entity, buyable.type);
	}

	buy(buyable: Buyable<Recruit>) {
		switch (buyable.type) {
			case "tower":
				this.buyTower(buyable as TowerBuyable);
		}
	}

	setHold(focus: null | TowerBuyable) {
		this.hold = focus;
	}

	moveHold(position: Position) {
		if (this.hold) {
			this.hold.position = position;
		}
	}

	getState() {
		const shopState: ShopState = {
			type: "shop",
			retail: this.retail,
			hold: this.hold,
			hudElements: [new StartBattleButton()],
			towers: this.army.towers.map((tower) => tower.toSerialized(this.army.grid)),
			castle: this.army.castle.toSerialized(this.army.grid),
			path: this.army.path,
			grid: this.army.grid.toSerialized(),
		};

		return shopState;
	}
}
