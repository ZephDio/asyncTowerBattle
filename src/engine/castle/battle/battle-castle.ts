import { Castle } from "../entity/castle";
import { CastleRecruit } from "../recruit/castle-recruit";
import { Cell, Position } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Derive } from "@ddd-ts/traits";
import { TPhysics } from "../../../shared/traits/physics";
import { GridElement } from "../../grid/grid";

export class BattleCastle extends Derive(TDrawable, TRenderable, TPhysics, GridElement) {
  public actualLife: number;
  public maxLife: number;
  public drawPriority: number;
  public draw!: CastleRecruit<Castle>["draw"];

  constructor(castleEntity: CastleRecruit<Castle>, public onDeath: () => void, public cell: Cell, public position: Position) {
    super({});
    this.drawPriority = castleEntity.drawPriority;
    this.draw = castleEntity.draw;
    this.actualLife = castleEntity.maxLife;
    this.maxLife = castleEntity.maxLife;
    this.cell = castleEntity.cell;
  }

  override takeDamage(damage: number): void {
    this.actualLife = this.actualLife - damage;
    if (!this.isAlive()) {
      this.onDeath();
    }
  }

  isAlive() {
    return this.actualLife > 0;
  }

  tick() {}

  toSerialized(): SerializedBattleCastle {
    return {
      type: "castle" as const,
      cell: this.cell,
      position: this.position,
    };
  }

  static toAllied(castleRecruit: CastleRecruit<Castle>, battleGrid: BattleGrid, onBattleOver: () => void) {
    return new BattleCastle(castleRecruit, onBattleOver, castleRecruit.cell, battleGrid.cellToReal(castleRecruit.cell));
  }

  static toEnemy(castleRecruit: CastleRecruit<Castle>, battleGrid: BattleGrid, onBattleOver: () => void) {
    const flippedGridPosition = BattleGrid.flip(battleGrid, castleRecruit.cell);
    return new BattleCastle(castleRecruit, onBattleOver, flippedGridPosition, battleGrid.cellToReal(flippedGridPosition));
  }
}

export type SerializedBattleCastle = {
  type: string;
  cell: Cell;
  position: Position;
};
