import { Position } from "../../../shared/position";
import { PathFinder } from "../../battle/path-finder";
import { Physic, PhysicEntity, Recruit } from "../../../shared/physic";
import { Projectile } from "../entity/projectile";

export abstract class BattleProjectile<PR extends Projectile> extends PhysicEntity<Projectile> {
  pathFinder: PathFinder;
  theta: number;
  constructor(public projectileRecruit: PR, position: Position, public onResolve: Function, public target: PhysicEntity<Recruit>, public damage: number) {
    const theta = Physic.getTheta(position, target.position)
    super(projectileRecruit, position, theta);
    this.theta = theta
    this.pathFinder = new PathFinder([target.position]);
  }

  abstract canMove(): boolean;

  followPath(): void {
    if (this.canMove() && !this.pathFinder.isArrived) {
      const [nextPosition, theta] = this.pathFinder.getNextPositionAndOrientation(this.position, this.entity.baseSpeed);
      this.updateTheta(theta)
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

  updateTheta(theta: number) {
    this.theta = theta
  }

  move(newPosition: Position) {
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }
}
