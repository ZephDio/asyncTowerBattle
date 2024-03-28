import { ShopState, ShopState2 } from "../../shared/gamestate";
import { StartBattleButton } from "../../shared/hud-element";
import { Position } from "../../shared/position";
import { Army } from "../army/entity/army";
import { Game } from "../game";
import { Recruit } from "../../shared/physic";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { Retail } from "./retail";
import { BuyableToken, TokenDrag, TowerToken } from "./token-dragable";
import { Grid } from "../grid/grid";

export abstract class Buyable<T extends Recruit = Recruit> {
	abstract type: string;
	abstract entity: T;
	abstract position: Position;

	static isTower(buyable: Buyable): buyable is TowerBuyable {
		return buyable.type === "tower";
	}
}

export abstract class TowerBuyable extends Buyable<TowerRecruit> {
	public type = "tower" as const;
}

export class Shop {
	public hold = null as null | TokenDrag;
	public retail = new Retail();
	constructor(
		public army: Army,
		public onShopExit: Game["handleShopQuit"],
	) {}

	exitShop() {
		if (this.hold) {
			this.hold.onRelease();
		}
		this.onShopExit();
	}

	buyTower(buyable: TowerBuyable, position: Position) {
		const gridPosition = this.army.grid.realPositionToGrid(position);
		if (!gridPosition) {
			throw new Error();
		}
		this.retail.removeItem(buyable);
		buyable.entity.gridPosition = gridPosition;
		this.army.recruit(buyable.entity, buyable.type);
	}

	buy(buyable: Buyable<Recruit>, position: Position) {
		if (Buyable.isTower(buyable)) {
			this.buyTower(buyable, position);
		}
	}

	setHoldFromRetail(buyable: Buyable, position: Position) {
		this.retail.removeItem(buyable);
		const token = new BuyableToken(buyable, position, (position: Position) => {
			try {
				this.buy(buyable, position);
				this.hold = null;
			} catch {
				this.retail.addItem(buyable);
				this.hold = null;
			}
		});
		this.setHold(token);
	}

	setHoldFromArmy(tower: TowerRecruit, position: Position) {
		this.army.towers.splice(this.army.towers.indexOf(tower), 1);
		this.army.grid.grid.delete(Grid.posToString(tower.gridPosition));
		const token = new TowerToken(tower, position, (position: Position) => {
			try {
				const gridPosition = this.army.grid.realPositionToGrid(position);
				if (gridPosition) {
					tower.gridPosition.gridX = gridPosition.gridX;
					tower.gridPosition.gridY = gridPosition.gridY;
					this.army.recruit(tower, "tower");
					this.hold = null;
					return;
				}
				throw new Error();
			} catch {
				this.army.recruit(tower, "tower");
				this.hold = null;
			}
		});
		this.setHold(token);
	}

	moveHold(position: Position) {
		if (this.hold) {
			this.hold.position = position;
		}
	}

	private setHold(token: TokenDrag) {
		if (this.hold) {
			this.hold.onRelease();
		}
		this.hold = token;
	}

	getState2() {
		// HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMm
		const shopState: ShopState2 = {
			type: "shop",
			retail: this.retail,
			hold: this.hold,
			hudElements: [new StartBattleButton()],
			towers: this.army.towers,
			castle: this.army.castle,
			path: this.army.path,
			grid: this.army.grid,
		};

		return shopState;
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
