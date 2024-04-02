import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

import { Bullet } from "../../../projectile/entity/implementation/bullet";
import { YellowTowerRecruit } from "../../recruit/implementation/yellow-tower-recruit";
import { GridElement } from "../../../grid/grid";
import { BasicPathTile, SlowingPathTile } from "../../../tile/entity/tile";

export class YellowTower extends Derive(TDrawable) {
  drawPriority = 5;
  patternEffect = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 }), new Cell({ x: 1, y: 0 }), new Cell({ x: -1, y: 0 })];
  isPatternActivated = (gridElement: GridElement | undefined) => {
    return gridElement ? gridElement instanceof BasicPathTile || gridElement instanceof SlowingPathTile : false;
  };
  type = "yellow" as const;

  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.tower.yellow.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.tower.green.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }

  toRecruit(cell: Cell) {
    return new YellowTowerRecruit(this, cell);
  }

  hitbox = new HitBox([[new HitShape("rectangle", { width: 4, height: 6 }), new Position({ x: 0, y: 0 })]]);
  projectile = new Bullet();
}
