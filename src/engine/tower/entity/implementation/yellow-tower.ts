import { Derive } from "@ddd-ts/traits";
import { HitBox, HitShape } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

import { Bullet } from "../../../projectile/entity/implementation/bullet";
import { YellowTowerRecruit } from "../../recruit/implementation/yellow-tower-recruit";
import { GridElement } from "../../../grid/grid";
import { BasicPathTile, SlowingPathTile } from "../../../tile/entity/tile";
import { TSynergy } from "../../../../shared/traits/synergy";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";

export class YellowTower extends Derive(
  TDamageDealer(10),
  TImageDrawable(Resources.tower.yellow.resource.image, Resources.tower.yellow.size, 3),
  TSynergy
) {
  patternEffect = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 }), new Cell({ x: 1, y: 0 }), new Cell({ x: -1, y: 0 })];
  isPatternActivated = (gridElement: GridElement | undefined) => {
    return gridElement ? gridElement instanceof BasicPathTile || gridElement instanceof SlowingPathTile : false;
  };
  type = "yellow" as const;

  toRecruit(cell: Cell) {
    return new YellowTowerRecruit(this, cell);
  }

  hitbox = new HitBox([[new HitShape("rectangle", { width: 4, height: 6 }), new Position({ x: 0, y: 0 })]]);
  projectile = new Bullet();
}
