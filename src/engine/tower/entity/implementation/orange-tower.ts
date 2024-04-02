import { Derive, implementsTrait } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { TowerRecruit } from "../../recruit/tower-recruit";
import { GridElement } from "../../../grid/grid";

export class OrangeTower extends Derive(TDrawable) {
  drawPriority: 5;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.tower.orange.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.tower.orange.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }

  toRecruit(cell: Cell) {
    return new OrangeTowerRecruit(this, cell);
  }
  patternEffect: Cell[] = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })];
  isPatternActivated = (gridElement : GridElement | undefined) => {
    return gridElement && implementsTrait(gridElement, TowerRecruit)
  }
  type = "orange" as const;
  hitbox = new HitBox([[new HitShape("ellipse", { width: 5, height: 5 }), new Position({ x: 0, y: 0 })]]);
  projectile = undefined;
}
