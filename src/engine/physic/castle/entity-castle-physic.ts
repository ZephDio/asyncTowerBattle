import { Castle, CastleEntity } from "../../castle/domain/castle";
import { Physic } from "../physic";

export class CastleEntityPhysic extends Physic<CastleEntity<Castle>>{
    constructor(castleEntity: CastleEntity<Castle>) {
        super(castleEntity)
    }
    tick() { }
}