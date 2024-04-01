import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

import { Bullet } from "../../../projectile/entity/implementation/bullet";
import { GreenTowerRecruit } from "../../recruit/implementation/green-tower-recruit";

export class GreenTower extends Derive(TDrawable) {
  drawPriority = 5;
  patternEffect: Cell[] = [];
  type = "green" as const;

  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.tower.green.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.tower.green.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }

  toRecruit(cell: Cell) {
    return new GreenTowerRecruit(this, cell);
  }

  hitbox = new HitBox([[new HitShape("rectangle", { width: 4, height: 6 }), new Position({ x: 0, y: 0 })]]);
  projectile = new Bullet();
}
