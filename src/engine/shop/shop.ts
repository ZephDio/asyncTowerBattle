import { StartBattleButton } from "../../shared/hud-element";
import { Position } from "../../shared/position";
import { Army } from "../army/entity/army";
import { Game } from "../game";
import { AnyTowerRecruit } from "../tower/recruit/tower-recruit";
import { Retail } from "./retail";
import { TokenDrag } from "./token-drag";
import { Grid } from "../grid/grid";
import { ShopState } from "../../shared/gamestate";
import { TDrawable, TRenderable } from "../../shared/traits/drawable";
import { Derive } from "@ddd-ts/traits";
import { AnyTower } from "../tower/entity/tower";
import { OverEffect } from "../grid/grid-effects/over-effect";
import { SynergyEffect } from "../grid/grid-effects/synerny-effect";

export class Buyable extends Derive(TDrawable, TRenderable) {
  draw!: AnyTower["draw"];
  drawPriority = 5;
  constructor(public entity: AnyTower, public position: Position) {
    super({});
    this.draw = this.entity.draw;
  }

  static from(entity: AnyTower, position: Position) {
    return new Buyable(entity, position);
  }
}

export class Shop {
  public hold = null as null | TokenDrag;
  public retail = new Retail();
  constructor(public army: Army, public onShopExit: Game["handleShopQuit"]) {}

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
    this.retail.removeItem(buyable);
    this.army.recruit(buyable.entity, cell);
  }

  buy(buyable: Buyable, position: Position) {
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

  setHoldFromArmy(tower: AnyTowerRecruit, position: Position) {
    this.army.towers.splice(this.army.towers.indexOf(tower), 1);
    this.army.grid.tiles.delete(Grid.posToString(tower.cell));
    const token = new TokenDrag(tower, position, (position?: Position) => {
      try {
        if (!position) throw new Error();
        const cell = this.army.grid.realPositionToGrid(position);
        if (cell) {
          tower.cell.x = cell.x;
          tower.cell.y = cell.y;
          this.army.add(tower);
          this.hold = null;
          return;
        }
        throw new Error();
      } catch {
        this.army.add(tower);
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
          ...this.army.grid.synergiesEffects.map((synergiesEffect) =>
          new SynergyEffect(synergiesEffect, this.army.grid))
      ],
      grid: this.army.grid,
    };
  }

  getState() {
    return {
      type: "shop",
      retail: this.retail,
      hold: this.hold,
      hudElements: [new StartBattleButton()],
      towers: this.army.towers,
      castle: this.army.castle,
      path: this.army.path,
      grid: this.army.grid,
    } as ShopState;
  }
}
