import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
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
import { TBuyable, TTowerBuyable } from "../../../shop/buyable";

export class YellowTower extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TDamageDealer(6),
	TImageDrawable(Resources.tower.yellow.resource.image, Resources.tower.yellow.size, 3),
	TSynergy,
	TTowerBuyable,
	TBuyable(10),
) {
	patternEffect = [
		new Cell({ x: 0, y: 1 }),
		new Cell({ x: 0, y: -1 }),
		new Cell({ x: 1, y: 0 }),
		new Cell({ x: -1, y: 0 }),
	];
	isPatternActivated = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		return gridElement ? gridElement instanceof BasicPathTile || gridElement instanceof SlowingPathTile : false;
	};
	type = "yellow" as const;

	toRecruit(cell: Cell) {
		return new YellowTowerRecruit(this, cell);
	}

	projectile = new Bullet();
}
