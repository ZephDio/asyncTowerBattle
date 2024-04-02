import { Derive } from "@ddd-ts/traits";
import { Position } from "../../shared/position";
import { AnyTowerRecruit } from "../tower/recruit/tower-recruit";
import { Buyable } from "./shop";
import { HTImageDrawable, TDrawable, TImageDrawable, TRenderable } from "../../shared/traits/drawable";
import { AnyPathTile } from "../tile/entity/tile";

type Holdable = Buyable | AnyTowerRecruit | AnyPathTile;

export class TokenDrag<T extends Holdable = Holdable> extends Derive(
  TDrawable,
  TRenderable,
  TImageDrawable(new Image(), { width: 4.9, height: 4.9 }, 2),
  HTImageDrawable
) {
  constructor(public entity: T, public position: Position, public onRelease: (position?: Position) => void) {
    super({ imageDrawable: entity });
  }

  drawPriority = 5;
}
