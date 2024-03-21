import { BattleArmy } from "../../army/battle/battle-army";
import { PhysicEntity } from "../../physic/physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { Tower } from "../entity/tower";
import { TowerRecruit } from "../recruit/tower-recruit";

export abstract class BattleTower<
  BT extends TowerRecruit<Tower>
> extends PhysicEntity<TowerRecruit<Tower>> {
  attackDamage: number
  target = null as null | PhysicEntity<UnitRecruit<Unit>>;
  attackIntent = null as null | TowerAttackIntent;
  abstract type: TowerRecruit<Tower>["type"];
  constructor(towerEntity: BT, public addProjectile: BattleArmy["addProjectile"], public removeProjectile: BattleArmy["removeProjectile"]) {
    super(towerEntity.clone(), towerEntity.position);
    this.attackDamage = this.entity.attackDamage
  }

  setTarget(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    this.target = enemyUnit;
  }

  isAttacked(damage: number): void { }

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
          const projectile = this.entity.getProjectile(this.removeProjectile.bind(this), this.target, this.position, this.attackDamage)
          this.addProjectile(projectile, this)
          this.attackIntent = null;
        }
      });
    }
  }

  onHit() {
    // lalalal
  }
}

export class TowerAttackIntent {
  progress = 0;
  constructor(
    public towerRecruit: BattleTower<TowerRecruit<Tower>>,
    public resolveAttack: Function
  ) { }

  tick() {
    this.progress += this.towerRecruit.entity.attackSpeed;
    if (this.progress >= 100) {
      this.resolveAttack();
    }
  }
}
