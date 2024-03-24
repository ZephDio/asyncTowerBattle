import { Castle } from "../entity/castle";
import { PhysicEntity } from "../../../shared/physic";
import { CastleRecruit } from "../recruit/castle-recruit";
import { Battle } from "../../battle/battle";

export class BattleCastle extends PhysicEntity<CastleRecruit<Castle>> {
  public type = "castle";
  public actualLife: number;
  public maxLife: number;

  constructor(castleEntity: CastleRecruit<Castle>, public onDeath: Function) {
    super(castleEntity, castleEntity.position);
    this.actualLife = castleEntity.maxLife;
    this.maxLife = castleEntity.maxLife;
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

  tick() {}
}
