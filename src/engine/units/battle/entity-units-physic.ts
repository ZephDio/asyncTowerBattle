import { Position } from "../../../shared/position";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { Path } from "../../path/entity/path";
import { PathFinder } from "../../physic/path-finder";
import { PhysicEntity } from "../../physic/physic";
import { Unit } from "../entity/units";
import { UnitRecruit } from "../recruit/unit-recruit";

export abstract class UnitRecruitPhysic<
  UE extends UnitRecruit<Unit>
> extends PhysicEntity<UE> {
  abstract speed: number;
  abstract actualLife: number;
  abstract maxLife: number;
  pathFinder: PathFinder;
  abstract attackSpeed: number;
  abstract attackDamage: number;
  attackIntent = null as null | UnitAttackIntent;
  target: BattleCastle;
  constructor(
    entity: UE,
    position: Position,
    path: Path,
    targetCastle: BattleCastle
  ) {
    super(entity, position);
    this.pathFinder = new PathFinder(path.getNodes());
    this.target = targetCastle;
  }

  abstract canMove(): boolean;

  followPath(): void {
    if (this.canMove() && !this.pathFinder.isArrived) {
      const tetha = this.pathFinder.getOrientation(this.position);
      const newPosition = {
        x: this.position.x + Math.cos(tetha)  * this.speed,
        y: this.position.y + Math.sin(tetha )* this.speed,
      };
      this.move(newPosition);
    }
  }

  move(newPosition: Position) {
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
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
