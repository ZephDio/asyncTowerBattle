import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { ShopState } from "../../shared/gamestate";
import { StartBattleButton } from "../../shared/hud-element";
import { Position } from "../../shared/position";
import { Army } from "../army/entity/army";
import { Game } from "../game";
import { Recruit } from "../../shared/physic";
import { Tower } from "../tower/entity/tower";
import { TowerFixtures } from "../tower/entity/tower-fixtures";
import { TowerRecruit } from "../tower/recruit/tower-recruit";
import { Retail } from "./retail";

export abstract class Buyable<T extends Recruit> {
  abstract type: string;
  abstract entity: T;
  abstract position: Position;
}

export abstract class TowerBuyable<T extends TowerRecruit<Tower>> extends Buyable<T> {
  public type = "tower";
  abstract entity: T;
}
export class Shop {
  public retail = new Retail();
  constructor(public army: Army, public onShopExit: Game["handleShopQuit"]) {}

  exitShop() {
    this.onShopExit();
  }

  buy(buyable: Buyable<Recruit>) {
    // if enough gold
    this.army.recruit(buyable.entity, buyable.type);
  }

  getState() {
    const towerBuyable = {
      type: "tower",
      entity: TowerFixtures.topRightTower,
    };
    const shopState: ShopState = {
      type: "shop",
      retail: this.retail,
      hudElements: [new StartBattleButton()],
    };

    return shopState;
  }
}
