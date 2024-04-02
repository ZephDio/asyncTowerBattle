import { BattleCastle } from "../../castle/battle/battle-castle";
import { AnyBattleTile } from "../../tile/battle/battle-tile";
export class BattlePath {
  constructor(public tiles: AnyBattleTile[], public alliedCastle: BattleCastle, public enemyCastle: BattleCastle) {}

  getNodes() {
    return [this.enemyCastle.position, ...this.tiles.map((t) => t.position), this.alliedCastle.position];
  }

  tick() {
    this.tiles.map((tile) => tile.tick());
  }
}
