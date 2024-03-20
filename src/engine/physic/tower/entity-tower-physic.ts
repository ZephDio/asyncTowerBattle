import { getDistance } from "../../../shared/position";
import {
  BlueTower,
  GreenTower,
  OrangeTower,
  Tower,
  TowerRecruit,
} from "../../tower/domain/tower";
import { Unit, UnitRecruit } from "../../units/domain/units";
import { PhysicEntity } from "../physic";

export class TowerAttackIntent {
  progress = 0;
  constructor(
    public towerRecruit: BattleTower<TowerRecruit<Tower>>,
    public resolveAttack: Function
  ) {}

  tick() {
    this.progress += this.towerRecruit.entity.attackSpeed;
    if (this.progress >= 100) {
      this.resolveAttack();
    }
  }
}

export abstract class BattleTower<
  BT extends TowerRecruit<Tower>
> extends PhysicEntity<TowerRecruit<Tower>> {
  target = null as null | PhysicEntity<UnitRecruit<Unit>>;
  attackIntent = null as null | TowerAttackIntent;
  abstract type: TowerRecruit<Tower>["type"];
  constructor(towerEntity: BT) {
    super(towerEntity.clone(), towerEntity.position);
  }

  setTarget(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    this.target = enemyUnit;
  }

  isAttacked(damage: number): void {}

  isAlive() {
    return true;
  }

  tick() {
    if (this.attackIntent) {
      this.attackIntent.tick();
    }
    if (!this.attackIntent) {
      this.attackIntent = new TowerAttackIntent(this, () => {
        if (this.target) {
          this.target.isAttacked(this.entity.attackDamage);
          this.attackIntent = null;
        }
      });
    }
  }
}

export class BlueBattleTower extends BattleTower<TowerRecruit<BlueTower>> {
  type = "blue" as const;
}

export class OrangeBattleTower extends BattleTower<TowerRecruit<OrangeTower>> {
  type = "orange" as const;
}

export class GreenBattleTower extends BattleTower<TowerRecruit<GreenTower>> {
  type = "green" as const;
}
