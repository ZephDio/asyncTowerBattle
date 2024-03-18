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
  arming = 0
  attackSpeed = 35
  attackDamage = 1
  constructor(entity: SoldierEntityUnit, path: Path) {
    super(entity, path);
  }
  canMove() {
    return true;
  }

  attack() {
    if (this.arming == this.attackSpeed) {
      this.target.damage(this.attackDamage)
      this.arming = 0
      return
    }
    ++this.arming
  }

  tick() {
    if (!this.pathFinder.isArrived) {
      this.followPath();
      return
    }
    this.attack()
  }
}
