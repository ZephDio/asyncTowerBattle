import { Position } from "../../../shared/position";
import {
  BlueTower,
  GreenTower,
  OrangeTower,
  Tower,
  TowerRecruit,
} from "../../tower/domain/tower";
import { PhysicEntity } from "../physic";

export abstract class BattleTower<
  BT extends TowerRecruit<Tower>
> extends PhysicEntity<TowerRecruit<Tower>> {
  abstract type: TowerRecruit<Tower>["type"];
  constructor(towerEntity: BT) {
    super(towerEntity.clone(), towerEntity.position);
  }

  abstract tick(): void;
}

export class BlueBattleTower extends BattleTower<TowerRecruit<BlueTower>> {
  type = "blue" as const;

  findTarget() {

  }

  tick() {
  }
}

export class OrangeBattleTower extends BattleTower<TowerRecruit<OrangeTower>> {
  type = "orange" as const;
  tick(): void { }
}

export class GreenBattleTower extends BattleTower<TowerRecruit<GreenTower>> {
  type = "green" as const;
  tick(): void { }
}
