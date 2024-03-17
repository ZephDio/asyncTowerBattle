import { proportion } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { Path } from "../../path/domain/path";
import { SoldierEntityUnit, Unit, UnitEntity } from "../../units/domain/units";
import { Physic } from "../physic";
import { PathFinder } from "./path-finder";

export abstract class EntityUnitPhysic<
  UE extends UnitEntity<Unit>
> extends Physic<UE> {
  speed: number = 1;
  pathFinder: PathFinder;
  constructor(entity: UE, path: Path) {
    super(entity);
    this.pathFinder = new PathFinder(path);
  }

  abstract canMove(): boolean;
  followPath(): void {
    if (this.canMove()) {
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
  constructor(entity: SoldierEntityUnit, path: Path) {
    super(entity, path);
  }
  canMove() {
    return true;
  }

  tick() {
    this.followPath();
  }
}
