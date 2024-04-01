import { Resources } from "../../../../renderer/resources";
import { Position } from "../../../../shared/position";
import { Explosion } from "../../../area-effect/implementation/explosion";
import { PathFinder } from "../../../battle/path-finder";
import { Rocket } from "../../entity/implementation/rocket";
import { BattleProjectile } from "../battle-projectile";

export class BattleRocketProjectile extends BattleProjectile<Rocket> {
  pathFinder = new PathFinder([new Position({ x: this.target.position.x, y: this.target.position.y })]);

  canMove(): boolean {
    return true;
  }

  isAlive(): boolean {
    return true;
  }

  override tick() {
    this.speed = this.speed + 0.12;
    this.followPath();
  }

  override hit() {
    this.hooks.addAreaEffect(
      new Explosion({ width: 10, height: 10 }, new Position({ x: this.position.x, y: this.position.y }), this.damage, this.hooks),
      this
    );
    this.hooks.removeProjectile(this);
  }

  isAttacked(): void {
    return;
  }

  public drawPriority = 5;
  draw(context: CanvasRenderingContext2D, position: Position) {
    const canvasPosition = this.getCanvasPosition(context, position);
    const size = this.getCanvasSize(context, 2, 2);
    const image = Resources.projectiles.rocket.resource.image;
    this.drawImage(context, size, canvasPosition, image, this.angle);
  }
}
