import { Position } from "../../../shared/position";
import { Castle, CastleRecruit } from "../../castle/domain/castle";
import { PhysicEntity } from "../physic";

export class CastleEntityPhysic extends PhysicEntity<CastleRecruit<Castle>> {
  constructor(castleEntity: CastleRecruit<Castle>) {
    super(castleEntity, castleEntity.position);
  }
  tick() {}
}
