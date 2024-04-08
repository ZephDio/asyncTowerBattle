import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { Rocket } from "../../../projectile/blueprint/implementation/rocket";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { BlueTower } from "../../recruit/implementation/blue-tower-recruit";
import { TDamageDealer } from "../../../../shared/traits/damage-dealer";
import { Derive } from "../../../../../traits/traits";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class BlueTowerBlueprint extends Derive(
	TShopBlueprint(10,10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TDamageDealer(7),
	TImageDrawable(Resources.tower.blue.resource.image, Resources.tower.blue.size, 3),
) {
	toRecruit(cell: Cell) {
		return new BlueTower(cell,this);
	}
	type = "blue" as const;
	projectile = new Rocket();
}


