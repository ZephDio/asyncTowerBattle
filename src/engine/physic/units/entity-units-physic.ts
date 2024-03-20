import { proportion } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { Castle, CastleRecruit } from "../../castle/domain/castle";
import { Path } from "../../path/domain/path";
import { SoldierRecruit, Unit, UnitRecruit } from "../../units/domain/units";
import { BattleCastle } from "../castle/battle-castle";
import { PhysicEntity } from "../physic";
import { PathFinder } from "./path-finder";

export abstract class UnitRecruitPhysic<
  UE extends UnitRecruit<Unit>
> extends PhysicEntity<UE> {
  abstract speed: number
  abstract actualLife: number
  abstract maxLife: number
  pathFinder: PathFinder;
  abstract attackSpeed: number;
  abstract attackDamage: number;
  attackIntent = null as null | UnitAttackIntent;
  target: BattleCastle;
  constructor(entity: UE, position: Position, path: Path, targetCastle: BattleCastle) {
    super(entity, position);
    this.pathFinder = new PathFinder(path);
    this.target = targetCastle;
  }

  abstract canMove(): boolean;

  followPath(): void {
    if (this.canMove() && !this.pathFinder.isArrived) {
      const tetha = this.pathFinder.getOrientation(this.position);
      const newPosition = {
        x: this.position.x + Math.cos(tetha * this.speed),
        y: this.position.y + Math.sin(tetha * this.speed),
      };
      this.move(newPosition);
    }
  }

  move(newPosition: Position) {
    this.position = newPosition;
  }
}

export class SoldierRecruitPhysic extends UnitRecruitPhysic<SoldierRecruit> {
  speed = 1;
  maxLife: number
  actualLife: number
  attackSpeed = 5;
  attackDamage = 1;
  constructor(entity: SoldierRecruit, position: Position, path: Path, targetCastle: BattleCastle, private onDeath: Function) {
    super(entity, position, path, targetCastle);
    this.speed = entity.speed
    this.maxLife = entity.maxLife;
    this.actualLife = entity.maxLife
  }
  canMove() {
    return true;
  }

  isAlive() {
    return this.actualLife > 0
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
    console.log('AIL')
    this.actualLife -= damage
    if (this.actualLife < 0) {
      this.onDeath(this)
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

export class UnitAttackIntent {
  progress = 0;
  constructor(
    public unitEntity: UnitRecruitPhysic<UnitRecruit<Unit>>,
    public resolveAttack: Function
  ) { }

  tick() {
    this.progress += this.unitEntity.attackSpeed;
    if (this.progress >= 100) {
      this.resolveAttack();
    }
  }
}



