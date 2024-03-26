import { ShopState } from "../../shared/gamestate";
import { StartBattleButton } from "../../shared/hud-element";
import { Position } from "../../shared/position";
import { Army } from "../army/entity/army";
import { Game } from "../game";
import { Recruit } from "../../shared/physic";
import { Tower } from "../tower/entity/tower";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { Retail } from "./retail";

export abstract class Buyable<T extends Recruit> {
  abstract type: string;
  abstract entity: T;
  abstract position: Position;
}

export abstract class TowerBuyable<T extends TowerRecruit<Tower>> extends Buyable<T> {
  public type = "tower" as const;
}

export class Shop {
  public hold = null as null | TowerBuyable<TowerRecruit<Tower>>;
  public retail = new Retail();
  constructor(public army: Army, public onShopExit: Game["handleShopQuit"]) { }

  exitShop() {
    this.onShopExit();
  }

  buyTower(buyable: TowerBuyable<TowerRecruit<Tower>>) {
    this.retail.removeItem(buyable);
    buyable.position = buyable.position; // ICI C KC
    this.army.recruit(buyable.entity, buyable.type);
  }

  buy(buyable: Buyable<Recruit>) {
    switch (buyable.type) {
      case "tower":
        this.buyTower(buyable as TowerBuyable<TowerRecruit<Tower>>);
    }
  }

  setHold(focus: null | TowerBuyable<TowerRecruit<Tower>>) {
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
      towers: this.army.towers.map((tower) => tower.toSerialized()),
      castle: this.army.castle.toSerialized(),
      path: this.army.path,
      grid: this.army.grid
    };

    return shopState;
  }
}
