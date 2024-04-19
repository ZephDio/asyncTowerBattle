import { Derive } from "@ddd-ts/traits";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Cell, GridPosition } from "../../../../shared/position";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { STANDARD_CELL_SIZE } from "../../../grid/tgrid";
import { CropsField } from "../../recruit/implementation/crops-flied-recruit";

export class CropsFieldBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
	TDescriptor,
	TImageDrawable(Resources.totem.cropsfield.resource.image, Resources.totem.cropsfield.size, 3),
) {
	description = new Description("Crops Field", ["A field to grow crops"]);

	toRecruit(cell: Cell) {
		return new CropsField(cell, this);
	}
}
