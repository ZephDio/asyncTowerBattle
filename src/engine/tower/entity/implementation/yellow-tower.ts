import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { HitBox, Rectangle } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

import { Bullet } from "../../../projectile/entity/implementation/bullet";
import { YellowTowerRecruit } from "../../recruit/implementation/yellow-tower-recruit";
import { GridElement } from "../../../grid/grid";
import { TSynergy } from "../../../../shared/traits/synergy";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { BasicPathTile } from "../../../tile/entity/implementation/basic-tile";
import { SlowingPathTile } from "../../../tile/entity/implementation/slowing-tile";

export class YellowTower extends Derive(
  TDamageDealer(6),
  TImageDrawable(Resources.tower.yellow.resource.image, Resources.tower.yellow.size, 3),
  TSynergy
) {
  patternEffect = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 }), new Cell({ x: 1, y: 0 }), new Cell({ x: -1, y: 0 })];
  isPatternActivated = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
    return gridElement ? gridElement instanceof BasicPathTile || gridElement instanceof SlowingPathTile : false;
  };
  type = "yellow" as const;

  toRecruit(cell: Cell) {
    return new YellowTowerRecruit(this, cell);
  }

  hitbox = new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]]);
  projectile = new Bullet();
}
