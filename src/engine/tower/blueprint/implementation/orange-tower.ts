import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { OrangeTower } from "../../recruit/implementation/orange-tower-recruit";
import { TSynergy } from "../../../../shared/traits/synergy";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
import { GridElement } from "../../../../shared/traits/grid-element";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class OrangeTowerBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.tower.orange.resource.image, Resources.tower.orange.size, 3),
	TSynergy,
) {
	patternEffect: Cell[] = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })];
	isPatternActivated = (gridElement: ImplementsTrait<typeof GridElement> | undefined) => {
		return gridElement ? implementsTrait(gridElement, HTDamageDealer) : false;
	};
	toRecruit(cell: Cell) {
		return new OrangeTower(cell, this);
	}

	projectile = undefined;
}
