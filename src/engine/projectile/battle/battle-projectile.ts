import { Position } from "../../../shared/position";
import { PathFinder } from "../../battle/path-finder";
import { Physic, PhysicEntity, Recruit } from "../../../shared/physic";
import { Projectile } from "../entity/projectile";

export abstract class BattleProjectile<PR extends Projectile> extends PhysicEntity<Projectile> {
  pathFinder: PathFinder;
  constructor(public projectileRecruit: PR, position: Position, public onResolve: Function, public target: PhysicEntity<Recruit>, public damage: number) {
    super(projectileRecruit, position);
    this.pathFinder = new PathFinder([target.position]);
  }

  abstract canMove(): boolean;

  followPath(): void {
    if (this.canMove() && !this.pathFinder.isArrived) {
      const nextPosition = this.pathFinder.getNextPosition(this.position, this.entity.baseSpeed);
      this.move(nextPosition);
    }
    if (this.pathFinder.isArrived) {
      this.hit();
    }
  }

  tick() {
    this.followPath();
  }

  hit() {
    this.target.isAttacked(this.damage);
    this.onResolve(this);
  }

  move(newPosition: Position) {
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }
}
