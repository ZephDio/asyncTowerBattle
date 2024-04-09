import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { CastleBlueprint } from "../blueprint/castle";
import { BattleCastle } from "../battle/battle-castle";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/recruit";
import { TokenHooks } from "../../shop/holder/holder";

export class Castle<TB extends CastleBlueprint = CastleBlueprint> extends Derive(TRecruit) {
  type: string = "castle";
  cell: Cell;
  maxLife: number;

  constructor(castle: TB) {
    super({ imageDrawable: castle, hitboxHolder: castle });
    this.cell = new Cell({ x: 12, y: 5 });
    this.maxLife = castle.maxLife;
  }

  clone() {
    // TODO
    return new Castle(new CastleBlueprint({}));
  }

  get position() {
    return this.cell;
  }

  toSerialized(grid: ArmyGrid): SerializedCastleRecruit {
    return {
      type: this.type,
      cell: this.cell,
      position: grid.cellToReal(this.cell),
    };
  }

  toAllied(grid: BattleGrid, onDeath: () => void): BattleCastle {
    const clone = this.clone();
    const position = grid.cellToReal(clone.cell);
    return new BattleCastle(clone, onDeath, clone.cell, position);
  }

  toEnemy(grid: BattleGrid, onDeath: () => void): BattleCastle {
    const clone = this.clone();
    const cell = BattleGrid.flip(grid, clone.cell);
    const position = grid.cellToReal(cell);
    const BC = new BattleCastle(clone, onDeath, cell, position);
    return BC;
  }

  moveRecruit(_hooks: TokenHooks, _position: Position): void {
    throw new Error("Cannot move castle");
  }
}

export type SerializedCastleRecruit = {
  type: string;
  cell: Cell;
  position: Position;
};
