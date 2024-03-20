import { Position } from "../../../../shared/position";
import { BattleCastle } from "../../../castle/battle/battle-castle";
import { Path } from "../../../path/entity/path";
import { SoldierRecruit } from "../../recruit/implementation/soldier-recruit";
import { UnitAttackIntent, UnitRecruitPhysic } from "../entity-units-physic";

export class SoldierRecruitPhysic extends UnitRecruitPhysic<SoldierRecruit> {
  speed = 1;
  maxLife: number;
  actualLife: number;
  attackSpeed = 5;
  attackDamage = 1;
  constructor(
    entity: SoldierRecruit,
    position: Position,
    path: Path,
    targetCastle: BattleCastle,
    private onDeath: Function
  ) {
    super(entity, position, path, targetCastle);
    this.speed = entity.speed;
    this.maxLife = entity.maxLife;
    this.actualLife = entity.maxLife;
  }
  canMove() {
    return true;
  }

  isAlive() {
    return this.actualLife > 0;
  }

  attack() {
    if (!this.attackIntent) {
      this.attackIntent = new UnitAttackIntent(this, () => {
        this.target.isAttacked(this.attackDamage);
        this.attackIntent = null;
      });
      return;
    }
    this.attackIntent.tick();
  }

  isAttacked(damage: number) {
    console.log("AIL");
    this.actualLife -= damage;
    if (this.actualLife < 0) {
      this.onDeath(this);
    }
  }

  tick() {
    if (!this.pathFinder.isArrived) {
      this.followPath();
      return;
    }
    this.attack();
  }
}
