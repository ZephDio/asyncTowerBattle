import { Castle } from "../entity/castle";
import { PhysicEntity } from "../../../shared/physic";
import { CastleRecruit } from "../recruit/castle-recruit";
import { GridPosition, Position } from "../../../shared/position";

export class BattleCastle extends PhysicEntity<CastleRecruit<Castle>> {
  public actualLife: number;
  public maxLife: number;
  public gridPosition: GridPosition

  constructor(castleEntity: CastleRecruit<Castle>, public onDeath: Function, position: Position) {
    super(castleEntity, position, 0, "castle");
    this.actualLife = castleEntity.maxLife;
    this.maxLife = castleEntity.maxLife;
    this.gridPosition = castleEntity.gridPosition
  }

  isAttacked(damage: number): void {
    this.actualLife = this.actualLife - damage;
    if (!this.isAlive()) {
      this.onDeath();
    }
  }

  isAlive() {
    return this.actualLife > 0;
  }

  tick() { }

  toSerialized(): SerializedBattleCastle {
    return {
      type: this.type,
      gridPosition: this.gridPosition
    }
  }
}

export type SerializedBattleCastle = {
  type: string,
  gridPosition: GridPosition
}
