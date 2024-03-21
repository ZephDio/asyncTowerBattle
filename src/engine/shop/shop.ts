import { ShopState } from "../../shared/gamestate";
import { Army } from "../army/entity/army";
import { Barrack } from "../barrack/entity/barrack";
import { Game } from "../game";
import { Tower } from "../tower/entity/tower";
import { TowerFixtures } from "../tower/entity/tower-fixtures";
import { Unit } from "../units/entity/units";

export type Buyable = {
    type : string
    entity : Tower | Barrack<Unit>
}

export class Shop {
    constructor(public army: Army, public onShopExit: Game["handleShopQuit"]){}

    exitShop(){
        this.onShopExit()
    }

    getState(){
        const towerBuyable = {
            type: "tower",
            entity: TowerFixtures.topRightTower
        }
        const shopState : ShopState = {
            type: "shop",
            buyables: [towerBuyable]
        }

        return shopState
    }
}