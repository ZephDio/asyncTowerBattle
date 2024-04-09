import { Derive } from "@ddd-ts/traits";
import { HTHitbox, TGCollider } from "../../../shared/hitboxes";
import { HTImageDrawable, TPriceHudRenderable, TRenderable } from "../../../shared/traits/drawable";
import { GridElement } from "../../../shared/traits/grid-element";
import { Cell } from "../../../shared/position";
import { AnyRecruit } from "../../../shared/traits/recruit";
import { THasPrice } from "../../../shared/traits/has-price";

export type AnyBuyable = AnyRecruit;

export class Buyable extends Derive(THasPrice, TGCollider, HTHitbox, TPriceHudRenderable, TRenderable, HTImageDrawable, GridElement) {
  drawPriority = 10;
  constructor(public entity: AnyBuyable, public cell: Cell, price: number) {
    super({ imageDrawable: entity, hitboxHolder: entity });
    this.price = price;
  }
  get position() {
    return this.cell;
  }

  static from(entity: AnyBuyable, price: number) {
    return new Buyable(entity, entity.cell, price);
  }
}
