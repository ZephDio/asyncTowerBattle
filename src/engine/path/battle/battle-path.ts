import { GridPosition, Position } from "../../../shared/position";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { SerializedPath } from "../entity/path";

export class BattlePathTile {
  constructor(public gridPosition: GridPosition, public position: Position, public type: string) {}
}
export class BattlePath {
  constructor(public tiles: BattlePathTile[], public alliedCastle: BattleCastle, public enemyCastle: BattleCastle) {}

  getNodes() {
    return [this.enemyCastle.position, ...this.tiles.map((t) => t.position), this.alliedCastle.position];
  }

  toSerialized(): SerializedPath {
    const serialized: SerializedPath = {
      tiles: this.tiles.map((tile) => {
        return { gridPosition: { gridX: tile.gridPosition.gridX, gridY: tile.gridPosition.gridY }, type: tile.type };
      }),
    };
    return serialized;
  }
}
