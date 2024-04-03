import { GoldDisplay, StartBattleButton } from "../../shared/hud-element";
import { Position } from "../../shared/position";
import { Army } from "../army/entity/army";
import { Game } from "../game";
import { AnyTowerRecruit } from "../tower/recruit/tower-recruit";
import { Retail } from "./retail";
import { TokenDrag } from "./token-drag";
import { ShopState } from "../../shared/gamestate";
import { HTImageDrawable, TDrawable, TImageDrawable, TRenderable } from "../../shared/traits/drawable";
import { Derive } from "@ddd-ts/traits";
import { AnyTower } from "../tower/entity/tower";
import { OverEffect } from "../grid/grid-effects/over-effect";
import { AnyPathTile } from "../tile/entity/tile";

export type EconomyHooks = {
  getEconomy: () => { gold: number };
  addGold: (amount: number) => void;
  spendGold: (amount: number) => void;
};

export class Buyable extends Derive(TDrawable, TRenderable, TImageDrawable(new Image(), { width: 0, height: 0 }, 0), HTImageDrawable) {
  drawPriority = 3;
  constructor(public entity: AnyTower, public position: Position, public price: number) {
    super({ imageDrawable: entity });
  }

  static from(entity: AnyTower, position: Position, price: number) {
    return new Buyable(entity, position, price);
  }
}

export class Shop {
  public hold = null as null | TokenDrag;
  public retail = new Retail();
  constructor(public army: Army, public onShopExit: Game["handleShopQuit"], public economyHooks: EconomyHooks) {}

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
    const token = new TokenDrag(buyable, position, (position?: Position) => {
      try {
        if (!position) throw new Error();
        this.buy(buyable, position);
        this.hold = null;
      } catch {
        this.retail.addItem(buyable);
        this.hold = null;
      }
    });
    this.setHold(token);
  }

  setHoldFromArmyTower(tower: AnyTowerRecruit, position: Position) {
    this.army.towers.splice(this.army.towers.indexOf(tower), 1);
    this.army.grid.deleteElement(tower);
    const token = new TokenDrag(tower, position, (position?: Position) => {
      try {
        if (!position) throw new Error();
        const cell = this.army.grid.realPositionToGrid(position);
        if (cell) {
          if (!this.army.isValidDestinationCell(cell)) {
            throw new Error();
          }
          tower.cell.x = cell.x;
          tower.cell.y = cell.y;
          this.army.addTower(tower);
          this.hold = null;
          return;
        }
        throw new Error();
      } catch {
        this.army.addTower(tower);
        this.hold = null;
      }
    });
    this.setHold(token);
  }

  setHoldFromArmyTiles(tile: AnyPathTile, position: Position) {
    this.army.path.tiles.splice(this.army.path.tiles.indexOf(tile), 1);
    this.army.grid.deleteElement(tile);

    const token = new TokenDrag(tile, position, (position?: Position) => {
      try {
        if (!position) throw new Error();
        const cell = this.army.grid.realPositionToGrid(position);
        if (cell) {
          if (!this.army.isValidDestinationCell(cell)) {
            throw new Error();
          }
          tile.cell.x = cell.x;
          tile.cell.y = cell.y;
          this.army.addTile(tile);
          this.hold = null;
          return;
        }
        throw new Error();
      } catch {
        this.army.addTile(tile);
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

  getDrawables() {
    return {
      drawables: [
        this.army.castle,
        ...this.army.towers,
        this.army.grid,
        ...this.retail.buyables.keys(),
        ...this.army.path.tiles,
        ...(this.hold ? [this.hold] : []),
        ...(this.army.grid.overEffect ? [new OverEffect(this.army.grid.overEffect, this.army.grid)] : []),
        ...this.army.grid.synergiesEffects,
        ...this.army.barracks,
        new StartBattleButton({}),
        new GoldDisplay(this.economyHooks.getEconomy().gold),
      ],
      grid: this.army.grid,
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
