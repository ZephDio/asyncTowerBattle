import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { GridElement } from "../../../grid/grid";
import { TSynergy } from "../../../../shared/traits/synergy";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
import { TBuyable, TTowerBuyable } from "../../../shop/buyable";

export class OrangeTower extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.tower.orange.resource.image, Resources.tower.orange.size, 3),
	TSynergy,
	TTowerBuyable,
	TBuyable(10),
) {
	patternEffect: Cell[] = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })];
	isPatternActivated = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		return gridElement ? implementsTrait(gridElement, HTDamageDealer) : false;
	};
	toRecruit(cell: Cell) {
		return new OrangeTowerRecruit(this, cell);
	}

	projectile = undefined;
}
