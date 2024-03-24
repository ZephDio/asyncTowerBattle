import { BattleArmy } from "../../army/battle/battle-army";
import { PhysicEntity } from "../../../shared/physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { Tower } from "../entity/tower";
import { TowerRecruit } from "../recruit/tower-recruit";
import { SearchTarget } from "../../battle/battlefield/battlefield";
import { UnitRecruitPhysic } from "../../units/battle/entity-units-physic";

export abstract class BattleTower<BT extends TowerRecruit<Tower>> extends PhysicEntity<TowerRecruit<Tower>> {
  attackDamage: number;
  target = null as null | UnitRecruitPhysic<UnitRecruit<Unit>>;
  attackIntent = null as null | TowerAttackIntent;
  abstract type: TowerRecruit<Tower>["type"];
  constructor(towerEntity: BT, public fire: BattleArmy["addProjectile"], public removeProjectile: BattleArmy["removeProjectile"], public searchTarget: SearchTarget) {
    super(towerEntity.clone(), towerEntity.position);
    this.attackDamage = this.entity.attackDamage;
  }

  setTarget(enemyUnit: UnitRecruitPhysic<UnitRecruit<Unit>> | null) {
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
        if (this.target && this.entity.doesTargetMatchesRule(this.target)) {
          this.attack(this.target);
          return;
        }
        const target = this.searchTarget(this);
        this.setTarget(target);
        if (this.target) {
          this.attack(this.target);
          return;
        }
      });
    }
  }

  attack(target: UnitRecruitPhysic<UnitRecruit<Unit>>) {
    const projectile = this.entity.getProjectile(this.removeProjectile, target, this.position, this.attackDamage);
    this.fire(projectile, this);
    this.attackIntent = null;
  }
}

export class TowerAttackIntent {
  progress = 0;
  constructor(public towerRecruit: BattleTower<TowerRecruit<Tower>>, public resolveAttack: Function) {}

  tick() {
    this.progress += this.towerRecruit.entity.attackSpeed;
    if (this.progress >= 100) {
      this.resolveAttack();
    }
  }
}
