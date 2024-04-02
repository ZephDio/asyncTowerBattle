import { Resources } from "../../../../renderer/resources";
import { Position } from "../../../../shared/position";
import { Bullet } from "../../entity/implementation/bullet";
import { BattleProjectile } from "../battle-projectile";

export class BattleBulletProjectile extends BattleProjectile<Bullet> {
  canMove() {
    return true;
  }

  public drawPriority = 5;

  draw(context: CanvasRenderingContext2D, position: Position) {
    context.globalAlpha = 1;
    const canvasPosition = this.getCanvasPosition(context, position);
    const size = this.getCanvasSize(context, 2, 2);
    const image = Resources.projectiles.bullet.resource.image;
    this.drawImage(context, size, canvasPosition, image, this.angle);
  }
}
