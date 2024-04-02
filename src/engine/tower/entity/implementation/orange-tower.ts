import { Derive, implementsTrait } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { TowerRecruit } from "../../recruit/tower-recruit";
import { GridElement } from "../../../grid/grid";
import { TSynergy } from "../../../../shared/traits/synergy";

export class OrangeTower extends Derive(
  TImageDrawable(Resources.tower.orange.resource.image, Resources.tower.orange.size, 3),
  TSynergy
) {
  patternEffect: Cell[] = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })];
  isPatternActivated = (gridElement: GridElement | undefined) => {
    return gridElement ? implementsTrait(gridElement, TowerRecruit) : false;
  };
  toRecruit(cell: Cell) {
    return new OrangeTowerRecruit(this, cell);
  }

  hitbox = new HitBox([[new HitShape("ellipse", { width: 5, height: 5 }), new Position({ x: 0, y: 0 })]]);
  projectile = undefined;
}
