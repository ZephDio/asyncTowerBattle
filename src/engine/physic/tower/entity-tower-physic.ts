import { Position } from "../../../shared/position";
import { Tower, TowerRecruit } from "../../tower/domain/tower";
import { PhysicEntity } from "../physic";

export class TowerEntityPhysic extends PhysicEntity<TowerRecruit<Tower>> {
  constructor(towerEntity: TowerRecruit<Tower>) {
    super(towerEntity, towerEntity.position);
  }

  tick() {}
}
