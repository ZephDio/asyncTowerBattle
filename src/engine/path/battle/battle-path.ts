import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../../shared/position";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { PathTile } from "../entity/path";

export class BattlePathTile extends Derive(TDrawable, TRenderable) {
  draw: PathTile["draw"];
  constructor(pathTile: PathTile, public cell: Cell, public position: Position) {
    super({});
    this.draw = pathTile.draw;
  }

  public drawPriority = 2;
}

export class BattlePath {
  constructor(public tiles: BattlePathTile[], public alliedCastle: BattleCastle, public enemyCastle: BattleCastle) {}

  getNodes() {
    return [this.enemyCastle.position, ...this.tiles.map((t) => t.position), this.alliedCastle.position];
  }
}
