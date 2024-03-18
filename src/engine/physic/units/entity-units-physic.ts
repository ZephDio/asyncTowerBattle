import { proportion } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { Castle, CastleEntity } from "../../castle/domain/castle";
import { Path } from "../../path/domain/path";
import { SoldierEntityUnit, Unit, UnitEntity } from "../../units/domain/units";
import { Physic } from "../physic";
import { PathFinder } from "./path-finder";

export abstract class EntityUnitPhysic<
  UE extends UnitEntity<Unit>
> extends Physic<UE> {
  speed: number = 1;
  pathFinder: PathFinder;
  abstract attackSpeed: number;
  abstract attackDamage: number;
  attackIntent = null as null | AttackIntent
  target: CastleEntity<Castle>;
  constructor(entity: UE, path: Path) {
    super(entity);
    this.pathFinder = new PathFinder(path);
    this.target = path.castleEntity
  }

  abstract canMove(): boolean;
  followPath(): void {
    if (this.canMove() && !this.pathFinder.isArrived) {
      const tetha = this.pathFinder.getOrientation(this.entity.position);
      const newPosition = {
        x: this.entity.position.x + Math.cos(tetha * this.speed),
        y: this.entity.position.y + Math.sin(tetha * this.speed),
      };
      this.move(newPosition);
    }
  }

  move(newPosition: Position) {
    this.entity.position = newPosition;
  }
}

export class SoldierEntityUnitPhysic extends EntityUnitPhysic<SoldierEntityUnit> {
  attackSpeed = 5
  attackDamage = 1
  constructor(entity: SoldierEntityUnit, path: Path) {
    super(entity, path);
  }
  canMove() {
    return true;
  }

  attack() {
    if (!this.attackIntent) {
      this.attackIntent = new AttackIntent(this, () => {
        this.target.damage(this.attackDamage)
        this.attackIntent = null
      })
      return
    }
    this.attackIntent.tick()
  }

  tick() {
    if (!this.pathFinder.isArrived) {
      this.followPath();
      return
    }
    this.attack()
  }
}

export class AttackIntent {
  progress = 0
  constructor(public unitEntity: EntityUnitPhysic<UnitEntity<Unit>>, public resolveAttack: Function) { }

  tick() {
    this.progress += this.unitEntity.attackSpeed
    if (this.progress >= 100) {
      this.resolveAttack()
    }
  }
}
