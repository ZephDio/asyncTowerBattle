import { Position } from "../../../shared/position";
import { Castle, CastleRecruit } from "../../castle/domain/castle";
import { PhysicEntity } from "../physic";

export class BattleCastle extends PhysicEntity<CastleRecruit<Castle>> {
  public actualLife: number;
  public maxLife: number;

  constructor(castleEntity: CastleRecruit<Castle>) {
    super(castleEntity, castleEntity.position);
    this.actualLife = castleEntity.maxLife;
    this.maxLife = castleEntity.maxLife;
  }
  tick() {}
}
