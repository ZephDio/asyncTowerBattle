import { Derive } from "@ddd-ts/traits";
import { Position } from "../../shared/position";
import { AnyTowerRecruit } from "../tower/recruit/tower-recruit";
import { Buyable } from "./shop";
import { TDrawable, TRenderable } from "../../shared/traits/drawable";

type Holdable = Buyable | AnyTowerRecruit;

export class TokenDrag<T extends Holdable = Holdable> extends Derive(TDrawable, TRenderable) {
  draw!: T["draw"];
  constructor(public entity: T, public position: Position, public onRelease: (position?: Position) => void) {
    super({});
    this.draw = entity.draw;
  }

  drawPriority = 5;
}
