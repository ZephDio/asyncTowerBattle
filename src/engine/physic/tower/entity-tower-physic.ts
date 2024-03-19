import { Position } from "../../../shared/position";
import { Tower, TowerEntity } from "../../tower/domain/tower";
import { Physic } from "../physic";

export class TowerEntityPhysic extends Physic<TowerEntity<Tower>>{

    constructor(towerEntity: TowerEntity<Tower>) {
        super(towerEntity, towerEntity.position);
    }

    tick() { }
}