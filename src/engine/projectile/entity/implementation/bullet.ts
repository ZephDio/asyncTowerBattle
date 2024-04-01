import { Resources } from "../../../../renderer/resources";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { Projectile } from "../projectile";

export class Bullet extends Projectile {
  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.projectiles.bullet.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.tower.green.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }

  type = "bullet" as const;
  hitbox = new HitBox([[new HitShape("ellipse", { width: 1, height: 1 }), new Position({ x: 0, y: 0 })]]);
  constructor(public baseSpeed: number = 2.8) {
    super({});
  }
}
