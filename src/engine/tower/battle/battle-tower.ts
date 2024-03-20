import { PhysicEntity } from "../../physic/physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { Tower } from "../entity/tower";
import { TowerRecruit } from "../recruit/tower-recruit";

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
