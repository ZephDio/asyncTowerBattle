import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { Rocket } from "../../../projectile/entity/implementation/rocket";
import { TDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { BlueTowerRecruit } from "../../recruit/implementation/blue-tower-recruit";

export class BlueTower extends Derive(TDrawable) {
  drawPriority: number;

  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.tower.blue.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.tower.green.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }

  toRecruit(cell: Cell) {
    return new BlueTowerRecruit(this, cell);
  }

  patternEffect: Cell[] = [];
  type = "blue" as const;
  hitbox = new HitBox([[new HitShape("ellipse", { width: 5, height: 10 }), new Position({ x: 0, y: 0 })]]);
  projectile = new Rocket();
}
